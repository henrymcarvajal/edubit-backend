import { AwsInfo } from '../../../../../client/aws/AwsInfo.mjs';
import { HttpResponseCodes } from '../../../../../commons/web/webResponses.mjs';
import {
  ParticipantProgressRepository
} from '../../../../../persistence/repositories/participantProgressRepository.mjs';
import { PartnershipMessages } from '../../commons/messages/partnership.mjs';
import { ValueValidationMessages } from '../../../../../commons/messages.mjs';
import { WORKSHOP_OPERATION_NAMES } from '../../definitions/operations.mjs';
import { PARTNERSHIP_STATUS } from '../../definitions/partnershipStatus.mjs';

import { authorizeAndFindParticipant } from '../../../../members/authorizers/participantAuthorizer.mjs';
import { execOnDatabase } from '../../../../../util/dbHelper.mjs';
import { getAuthorizationResult } from '../../commons/getAuthorizationResult.mjs';
import { getParticipantProgress } from '../../commons/getParticipantProgress.mjs';
import { handleErrorResponse } from '../../../../commons/errorHandling.mjs';
import { invokeLambda } from '../../../../../client/aws/clients/lambdaClient.mjs';
import { sendResponse } from '../../../../../util/responseHelper.mjs';
import { validate as uuidValidate } from 'uuid';

import { ForbiddenOperationError } from '../../../../commons/errors/security/restrictedAccess.mjs';
import { InvalidInputError } from '../../../../commons/errors/data/input.mjs';
import { messageQueue } from '../../../../../client/aws/clients/sqsClient.mjs';
import { ParticipantRepository } from '../../../../../persistence/repositories/participantRepository.mjs';

export const handle = async (event) => {
  try {
    const { workshopExecutionId, participantId, partnerId } = validateAndExtractParams(event);
    const participant = await authorizeAndFindParticipant(event, participantId);

    const participantProgress = await getParticipantProgress(participantId, workshopExecutionId);
    const partnerProgress = await getParticipantProgress(partnerId, workshopExecutionId);

    updatePartnershipProposal(partnerProgress, participantProgress);
    const partnerShip = createPartnership(participantProgress, partnerProgress);
    await updateProgresses(partnerProgress, participantProgress);

    await notifyEvent(workshopExecutionId, participantProgress, partnerProgress, partnerShip.partnershipName);

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

const updatePartnershipProposal = (partnerProgress, participantProgress) => {
  if (partnerProgress.details?.society?.partnerId !== participantProgress.participantId) {
    throw new ForbiddenOperationError(PartnershipMessages.NOT_MEMBER_OF_MEMBERSHIP);
  }
  partnerProgress.details.society.status = PARTNERSHIP_STATUS.CONFIRMED;
};

const createPartnership = (participantProgress, partnerProgress) => {
  participantProgress.details.society = {
    partnerId: partnerProgress.participantId,
    status: PARTNERSHIP_STATUS.CONFIRMED,
    partnershipName: partnerProgress.details.society.partnershipName
  };

  return participantProgress.details.society;
};

const updateProgresses = async (participantProgress, partnerProgress) => {
  participantProgress.modificationDate = new Date();
  partnerProgress.modificationDate = new Date();

  const {
    entity: participantEntity,
    statement: participantStatement
  } = ParticipantProgressRepository.upsertStatement(participantProgress);
  const {
    entity: partnerEntity,
    statement: partnerStatement
  } = ParticipantProgressRepository.upsertStatement(partnerProgress);

  await execOnDatabase(
      [{ statement: participantStatement, parameters: participantEntity },
        { statement: partnerStatement, parameters: partnerEntity }]
  );
};


const notifyEvent = async (workshopExecutionId, participantProgress, partnerProgress, partnershipName) => {
  const [participant] = await ParticipantRepository.findById(participantProgress.participantId);
  const participantName = `${ participant.name } (${ participant.email })`;

  const [partner] = await ParticipantRepository.findById(partnerProgress.participantId);
  const partnerName = `${ partner.name } (${ partner.email })`;

  await messageQueue(AwsInfo.EVENT_REGISTRY_QUEUE, {
    workshopExecutionId,
    participantName,
    operationName: WORKSHOP_OPERATION_NAMES.PARTICIPANT_ACCEPT_SOCIETY,
    complement: { partnerName, partnershipName }
  });
};