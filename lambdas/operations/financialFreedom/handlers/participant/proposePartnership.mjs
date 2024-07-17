import { AwsInfo } from '../../../../../client/aws/AwsInfo.mjs';
import { HttpResponseCodes } from '../../../../../commons/web/webResponses.mjs';
import { ValueValidationMessages } from '../../../../../commons/messages.mjs';
import { WORKSHOP_OPERATION_NAMES } from '../../definitions/operations.mjs';

import { authorizeAndFindParticipant } from '../../../../members/authorizers/participantAuthorizer.mjs';
import { extractBody } from '../../../../../client/aws/utils/bodyExtractor.mjs';
import { getAuthorizationResult } from '../../commons/getAuthorizationResult.mjs';
import { getParticipantProgress } from '../../commons/getParticipantProgress.mjs';
import { handleErrorResponse } from '../../../../commons/errorHandling.mjs';
import { invokeLambda } from '../../../../../client/aws/clients/lambdaClient.mjs';
import { messageQueue } from '../../../../../client/aws/clients/sqsClient.mjs';
import { sendResponse } from '../../../../../util/responseHelper.mjs';
import { validate as uuidValidate } from 'uuid';

import { ForbiddenOperationError } from '../../../../commons/errors/security/restrictedAccess.mjs';
import { InvalidInputError } from '../../../../commons/errors/data/input.mjs';
import { isEmptyString } from '../../../../../util/string.mjs';
import { PARTNERSHIP_STATUS } from '../../definitions/partnershipStatus.mjs';
import {
  ParticipantProgressRepository
} from '../../../../../persistence/repositories/participantProgressRepository.mjs';
import { execOnDatabase } from '../../../../../util/dbHelper.mjs';
import { ResourceStateError } from '../../../../commons/errors/integrity/resources.mjs';
import { PartnershipMessages } from '../../commons/messages/messages.mjs';

export const handle = async (event) => {
  try {

    const { participantId, workshopExecutionId, partnerId, name } = validateAndExtractParams(event);
    const participant = await authorizeAndFindParticipant(event, participantId);

    const progress = await getParticipantProgress(participantId, workshopExecutionId);

    const partnerShip = createPartnershipProposal(progress.details, participantId, partnerId, name);
    await updateProgress(progress);

    await notifyEvent(workshopExecutionId, participant, partnerShip);

    return sendResponse(HttpResponseCodes.OK, partnerShip);
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
    throw new InvalidInputError(`${ ValueValidationMessages.VALUE_IS_NOT_UUID } (workshopExecutionId): ${ workshopExecutionId }`);
  }

  const { body: { partnerId, name } } = extractBody(event);
  if (!uuidValidate(partnerId)) {
    throw new InvalidInputError(`${ ValueValidationMessages.VALUE_IS_NOT_UUID } (partnerId): ${ partnerId }`);
  }

  if (isEmptyString(name)) {
    throw new InvalidInputError(`Nombre no puede ser vacío`);
  }

  return { participantId, workshopExecutionId, partnerId, name };
};

const authorizeOperation = async (workshopExecutionId, participantId) => {

  const operation = WORKSHOP_OPERATION_NAMES.PARTICIPANT_BUY_IMPROVEMENT;
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

const createPartnershipProposal = (details, participantId, partnerId, name) => {
  if (details.society.status === PARTNERSHIP_STATUS.CONFIRMED) {
    throw new ResourceStateError(PartnershipMessages.PARTNERSHIP_ALREADY_CONFIRMED);
  };

  details.society = {
    partnerId,
    name,
    status: PARTNERSHIP_STATUS.PENDING
  };

  return details.society;
};

const updateProgress = async (progress) => {
  progress.modificationDate = new Date();
  const { entity, statement } = ParticipantProgressRepository.upsertStatement(progress);
  await execOnDatabase({ statement, parameters: entity });
};


const notifyEvent = async (workshopExecutionId, participant, requestedImprovements) => {
  /*const participantName = participant.name;
  const improvementNames = requestedImprovements.map(i => i.name);
  await messageQueue(AwsInfo.EVENT_REGISTRY_QUEUE, {
    workshopExecutionId,
    participantName,
    operationName: WORKSHOP_OPERATION_NAMES.PARTICIPANT_BUY_IMPROVEMENT,
    improvementNames
  });*/
};