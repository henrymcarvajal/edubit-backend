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
    const { workshopExecutionId, participantId, partnerId } = validateAndExtractParams(event);
    const participant = await authorizeAndFindParticipant(event, participantId);

    const participantProgress = await getParticipantProgress(participantId, workshopExecutionId);
    const partnerProgress = await getParticipantProgress(partnerId, workshopExecutionId);

    updatePartnershipProposal(partnerProgress.details);
    const partnerShip = createPartnership(participantProgress.details, participantId, partnerId);
    await updateProgresses(partnerProgress, participantProgress);

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

  const partnerId = event.pathParameters.partnerId;
  if (!uuidValidate(partnerId)) {
    throw new InvalidInputError(`${ ValueValidationMessages.VALUE_IS_NOT_UUID } (partnerId): ${ partnerId }`);
  }

  return { workshopExecutionId, participantId, partnerId };
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

const updatePartnershipProposal = (details) => {
  details.society.status = PARTNERSHIP_STATUS.CONFIRMED
};

const createPartnership = (details, partnerId) => {
  details.society = {
    partnerId,
    status: PARTNERSHIP_STATUS.CONFIRMED
  };

  return details.society;
};

const updateProgresses = async (participantProgress, partnerProgress) => {
  participantProgress.modificationDate = new Date();
  partnerProgress.modificationDate = new Date();

  const { entity: participantEntity, statement: participantStatement } = ParticipantProgressRepository.upsertStatement(participantProgress);
  const { entity: partnerEntity, statement: partnerStatement } = ParticipantProgressRepository.upsertStatement(participantProgress);

  await execOnDatabase(
      [{ statement: participantStatement, parameters: participantEntity },
      { statement: partnerStatement, parameters: partnerEntity }]
  );
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