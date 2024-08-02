import AssetRepository from '../../../../../persistence/repositories/assetRepository.mjs';
import ParticipantProgressRepository from '../../../../../persistence/repositories/participantProgressRepository.mjs';
import { AwsInfo } from '../../../../../client/aws/AwsInfo.mjs';
import { BUYER_OPTIONS } from '../../commons/constants.mjs';
import { FINANCIAL_SOURCES_OPTIONS, roundTwoDecimalPositions } from '../../commons/calculators/financialSources.mjs';
import { HttpResponseCodes } from '../../../../../commons/web/webResponses.mjs';
import { PartnershipMessages } from '../../commons/messages/partnershipMessages.mjs';
import { PARTNERSHIP_STATUS } from '../../definitions/partnershipStatus.mjs';
import { PurchasesMessages } from '../../commons/messages/purchasesMessages.mjs';
import { ValueValidationMessages } from '../../../../../commons/messages.mjs';
import { WORKSHOP_OPERATION_NAMES } from '../../definitions/operations.mjs';

import makePurchase from '../../commons/calculators/purchasesManager.mjs';
import { arrayIsNotEmpty } from '../../../../../util/arrays.mjs';
import { authorizeAndFindParticipant } from '../../../../members/authorizers/participantAuthorizer.mjs';
import { extractBody } from '../../../../../client/aws/utils/bodyExtractor.mjs';
import { execOnDatabase } from '../../../../../util/dbHelper.mjs';
import { getAuthorizationResult } from '../../commons/getAuthorizationResult.mjs';
import { getParticipantProgress } from '../../commons/getParticipantProgress.mjs';
import { handleErrorResponse } from '../../../../commons/errorHandling.mjs';
import { invokeLambda } from '../../../../../client/aws/clients/lambdaClient.mjs';
import { messageQueue } from '../../../../../client/aws/clients/sqsClient.mjs';
import { sendResponse } from '../../../../../util/responseHelper.mjs';

import { validate as uuidValidate } from 'uuid';
import { ForbiddenOperationError } from '../../../../commons/errors/security/restrictedAccess.mjs';
import { InvalidInputError } from '../../../../commons/errors/data/input.mjs';
import { ResourceStateError } from '../../../../commons/errors/integrity/resources.mjs';

exports.handle = async (event) => {
  try {
    const { participantId, workshopExecutionId, assetIds, source, buyer } = validateAndExtractParams(event);

    const participant = await authorizeAndFindParticipant(event, participantId);

    await authorizeOperation(workshopExecutionId, participantId);

    const progresses = await validatePartnership(participantId, workshopExecutionId, buyer);
    const requestedAssets = await validateAssetsIds(assetIds);
    const [savedProgress] = await processAssets(progresses, requestedAssets, source, buyer);

    await notifyEvent(workshopExecutionId, participant, requestedAssets);

    return sendResponse(HttpResponseCodes.OK, savedProgress.details);
  } catch (error) {
    return handleErrorResponse(error);
  }
};

const validateAndExtractParams = (event) => {
  const participantId = event.pathParameters.participantId;
  if (!uuidValidate(participantId)) {
    throw new InvalidInputError(`${ ValueValidationMessages.VALUE_IS_NOT_UUID } (participantId)}: ${ participantId }`);
  }

  const workshopExecutionId = event.pathParameters.workshopExecutionId;
  if (!uuidValidate(workshopExecutionId)) {
    throw new InvalidInputError(`${ ValueValidationMessages.VALUE_IS_NOT_UUID } (workshopExecutionId)}: ${ workshopExecutionId }`);
  }

  let { body: { assetIds, source, buyer } } = extractBody(event);
  if (arrayIsNotEmpty(assetIds)) {
    assetIds.forEach((assetId) => {
      if (!uuidValidate(assetId)) {
        throw new InvalidInputError(`${ ValueValidationMessages.VALUE_IS_NOT_UUID } (assetId)}: ${ assetId }`);
      }
    });
  } else {
    throw new InvalidInputError(PurchasesMessages.MISSING_ASSETS_TO_BUY);
  }

  if (source) {
    const sourceKeys = Object.keys(FINANCIAL_SOURCES_OPTIONS);
    if (!sourceKeys.includes(source)) {
      throw new InvalidInputError(PurchasesMessages.INVALID_SOURCE);
    }
  }

  if (buyer) {
    const buyerKeys = Object.keys(BUYER_OPTIONS);
    if (!buyerKeys.includes(buyer)) {
      throw new InvalidInputError(PurchasesMessages.INVALID_BUYER);
    }
  }

  return { participantId, workshopExecutionId, assetIds, source, buyer };
};

const authorizeOperation = async (workshopExecutionId, participantId) => {
  const operation = WORKSHOP_OPERATION_NAMES.PARTICIPANT_PURCHASE_ASSET;
  const result = await invokeLambda(
      AwsInfo.WORKSHOPS_OPERATIONS_AUTHORIZER,
      {
        operationName: operation,
        participantId: participantId,
        workshopExecutionId: workshopExecutionId
      });

  const authorize = getAuthorizationResult(result);
  if (!authorize) {
    throw new ForbiddenOperationError(`Operation ${ operation } cannot be performed at this moment`);
  }
};

const validatePartnership = async (participantId, workshopExecutionId, buyer) => {
  const progress = await getParticipantProgress(participantId, workshopExecutionId);
  let progresses = [progress];

  if (buyer === BUYER_OPTIONS.PARTNERSHIP) {
    checkPartnership(progress);

    const otherProgress = await getParticipantProgress(progress.details.partnership.partnerId, workshopExecutionId);
    checkPartnership(otherProgress);

    progresses = [...progresses, otherProgress];
  }

  return progresses;
};

const checkPartnership = (progress) => {
  if (!progress.details.partnership) {
    throw new ResourceStateError(PartnershipMessages.PARTNERSHIP_NON_EXISTENT);
  }

  if (progress.details.partnership.status !== PARTNERSHIP_STATUS.CONFIRMED) {
    throw new ResourceStateError(PartnershipMessages.PARTNERSHIP_NOT_CONFIRMED);
  }
};

const validateAssetsIds = async (assetIds) => {
  const foundAssets = await AssetRepository.findByIdIn(assetIds);
  if (!assetIds || (assetIds.length !== foundAssets.length)) {
    throw new InvalidInputError(`Invalid assets ids`);
  }

  return foundAssets;
};

const processAssets = async (progresses, foundAssets, source, buyer) => {
  const totalCost = makePurchase(progresses, foundAssets, source, buyer);

  updateAssets(progresses, foundAssets, buyer);
  updateBalance(progresses, totalCost, buyer);

  console.log('processAssets');

  return saveProgresses(progresses);
};

const updateBalance = (progresses, totalCost, buyer) => {
  const participationRate = buyer === BUYER_OPTIONS.PARTICIPANT ? 1.0 : 5.0;
  for (const progress of progresses) {
    progress.details.stats.balance -= roundTwoDecimalPositions(participationRate * totalCost);
  }
  console.log('updateBalance');
};

const updateAssets = (progresses, foundAssets, buyer) => {
  for (const progress of progresses) {
    if (buyer === BUYER_OPTIONS.PARTICIPANT) {
      if (!progress.details.assets) {
        progress.details.assets = [];
      }

      for (const foundAsset of foundAssets) {
        let index = progress.details.assets.find(a => a.id === foundAsset.id);
        if (index) {
          index.count++;
        } else {
          progress.details.assets.push({
            id: foundAsset.id,
            count: 1,
            type: foundAsset.type,
            value: foundAsset.price });
        }
      }
    } else {
      if (!progress.details.partnership.assets) {
        progress.details.partnership.assets = [];
      }

      for (const foundAsset of foundAssets) {
        let index = progress.details.partnership.assets.find(a => a.id === foundAsset.id);
        if (index) {
          index.count++;
        } else {
          progress.details.partnership.assets.push({
            id: foundAsset.id,
            count: 1,
            type: foundAsset.type,
            value: foundAsset.price
          });
        }
      }
    }
  }
  console.log('updateAssets');
};

const saveProgresses = async (progresses) => {
  const savedProgresses = [];
  for (const progress of progresses) {
    const { entity, statement } = ParticipantProgressRepository.upsertStatement(progress);
    const savedProgress = await execOnDatabase({ statement: statement, parameters: entity });
    console.log('savedProgress', savedProgress);
    savedProgresses.push(savedProgress);
  }
  console.log('saveProgresses', savedProgresses);
  return savedProgresses;
};

const notifyEvent = async (workshopExecutionId, participant, requestedAssets) => {
  /*const participantName = participant.name;
  const assetNames = requestedAssets.map(i => i.title);
  await messageQueue(AwsInfo.EVENT_REGISTRY_QUEUE, {
    workshopExecutionId,
    participantName,
    operationName: WORKSHOP_OPERATION_NAMES.PARTICIPANT_PURCHASE_ASSET,
    assetIds: assetNames
  });*/
};

