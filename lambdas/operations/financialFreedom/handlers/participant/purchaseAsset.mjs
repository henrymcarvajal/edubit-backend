import { AssetRepository } from '../../../../../persistence/repositories/assetRepository.mjs';
import { AwsInfo } from '../../../../../client/aws/AwsInfo.mjs';
import { HttpResponseCodes } from '../../../../../commons/web/webResponses.mjs';
import {
  ParticipantProgressRepository
} from '../../../../../persistence/repositories/participantProgressRepository.mjs';
import { ValueValidationMessages } from '../../../../../commons/messages.mjs';
import { WORKSHOP_OPERATION_NAMES } from '../../definitions/operations.mjs';

import { authorizeAndFindParticipant } from '../../../../members/authorizers/participantAuthorizer.mjs';
import { handleErrorResponse } from '../../../../commons/errorHandling.mjs';
import { sendResponse } from '../../../../../util/responseHelper.mjs';
import { extractBody } from '../../../../../client/aws/utils/bodyExtractor.mjs';
import { execOnDatabase } from '../../../../../util/dbHelper.mjs';
import { getParticipantProgress } from '../../commons/getParticipantProgress.mjs';
import { invokeLambda } from '../../../../../client/aws/clients/lambdaClient.mjs';
import { messageQueue } from '../../../../../client/aws/clients/sqsClient.mjs';
import { validate as uuidValidate } from 'uuid';

import { ForbiddenOperationError } from '../../../../commons/errors/security/restrictedAccess.mjs';
import { InvalidInputError } from '../../../../commons/errors/data/input.mjs';
import { ResourceStateError } from '../../../../commons/errors/integrity/resources.mjs';

export const handle = async (event) => {
  try {
    const { participantId, workshopExecutionId } = validateAndExtractParams(event);

    const participant = await authorizeAndFindParticipant(event, participantId);

    await authorizeOperation(workshopExecutionId, participantId);

    const progress = await getParticipantProgress(participantId, workshopExecutionId);
    const requestedAssets = await validateAssetsIds(body.assetIds);
    const savedProgress = await processAssets(progress, requestedAssets);

    await notifyEvent(workshopExecutionId, participant, requestedAssets)

    return sendResponse(HttpResponseCodes.OK, savedProgress);
  } catch (error) {
    return handleErrorResponse(error);
  }
};

const validateAndExtractParams = (event) => {

  const participantId = event.pathParameters.participantId;
  const workshopExecutionId = event.pathParameters.workshopExecutionId;

  if (!uuidValidate(participantId)) {
    throw new InvalidInputError(`${ ValueValidationMessages.VALUE_IS_NOT_UUID } (participantId)}: ${ participantId }`);
  }

  if (!uuidValidate(workshopExecutionId)) {
    throw new InvalidInputError(`${ ValueValidationMessages.VALUE_IS_NOT_UUID } (workshopExecutionId)}: ${ workshopExecutionId }`);
  }

  return {participantId, workshopExecutionId};
};

const validateAssetsIds = async (assetIds) => {
  const foundAssets = await AssetRepository.findByIdIn(assetIds);
  if (!assetIds || (assetIds.length !== foundAssets.length)) {
    throw new InvalidInputError(`Invalid assets ids`);
  }

  return foundAssets;
};

const authorizeOperation = async (workshopExecutionId, participantId) => {

  const operation = WORKSHOP_OPERATION_NAMES.PARTICIPANT_PURCHASE_ASSET;
  const { authorize } = await invokeLambda(
      AwsInfo.WORKSHOPS_OPERATIONS_AUTHORIZER,
      {
        operationName: operation,
        participantId: participantId,
        workshopExecutionId: workshopExecutionId
      });

  if (!authorize) {
    throw new ForbiddenOperationError(`Operation ${ operation } cannot be performed at this moment`);
  }
};

const processAssets = async (progress, foundAssets) => {
  const totalCost = foundAssets.reduce((accumulator, asset) => accumulator + asset.price, 0);
  if (totalCost > progress.details.stats.balance) {
    throw new ResourceStateError('Not enough funds!');
  }

  updateProgress(progress, foundAssets, totalCost);

  const { entity, statement } = ParticipantProgressRepository.upsertStatement(progress);
  return await execOnDatabase({ statement: statement, parameters: entity });
};

const updateProgress = (progress, foundAssets, totalCost) => {
  if (!progress.details.assets) {
    progress.details.assets = [];
  }

  for (const foundAsset of foundAssets) {
    let index = progress.details.assets.find(a => a.id === foundAsset.id);
    if (index) {
      index.count++;
    } else {
      progress.details.assets.push({ id: foundAsset.id, count: 1 });
    }
  }

  progress.details.stats.balance -= totalCost;
};

const notifyEvent = async (workshopExecutionId, participant, requestedAssets) => {
  const participantName = participant.name;
  const assetNames = requestedAssets.map(i => i.title);
  await messageQueue(AwsInfo.EVENT_REGISTRY_QUEUE, {
    workshopExecutionId,
    participantName,
    operationName: WORKSHOP_OPERATION_NAMES.PARTICIPANT_PURCHASE_ASSET,
    assetIds: assetNames
  });
};