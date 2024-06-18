import { AwsInfo } from '../../../../../client/aws/AwsInfo.mjs';
import { HttpResponseCodes } from '../../../../../commons/web/webResponses.mjs';
import {
  ParticipantProgressRepository
} from '../../../../../persistence/repositories/participantProgressRepository.mjs';
import { ParticipantRepository } from '../../../../../persistence/repositories/participantRepository.mjs';
import { ValueValidationMessages } from '../../../../../commons/messages.mjs';
import { WORKSHOP_OPERATION_NAMES } from '../../definitions/operations.mjs';

import { authorizeAndFindMentor } from './mentorAuthorizer.mjs';
import { execOnDatabase } from '../../../../../util/dbHelper.mjs';
import { getParticipantProgress } from '../participant/participanProgress.mjs';
import { handleError } from '../errorHandling.mjs';
import { invokeLambda } from '../../../../../client/aws/clients/lambdaClient.mjs';
import { messageQueue } from '../../../../../client/aws/clients/sqsClient.mjs';
import { sendResponse } from '../../../../../util/responseHelper.mjs';
import { validate as uuidValidate } from 'uuid';

import { InvalidRequestError, NoPurchaseAllowedError } from '../../validations/error.mjs';
import { InvalidUuidError } from '../../../../commons/validations/error.mjs';

export const handle = async (event) => {

  try {

    const { workshopExecutionId, mentorId, participantId } = validateAndExtractParams(event);

    const { response } = await authorizeAndFindMentor(event, mentorId);
    if (response) return response;

    await authorizeOperation(workshopExecutionId, participantId);

    const participant = await getParticipant(participantId, workshopExecutionId);

    const newLevel = await processLevel(workshopExecutionId, participantId);

    await notifyEvent(workshopExecutionId, participant, newLevel);

    return sendResponse(HttpResponseCodes.OK, newLevel);
  } catch (error) {
    return handleError(error);
  }
};

const validateAndExtractParams = (event) => {
  const workshopExecutionId = event.pathParameters.workshopExecutionId;
  const mentorId = event.headers.mentorid; // AWS lowercases all headers' names
  const participantId = event.pathParameters.participantId;

  if (!uuidValidate(workshopExecutionId)) {
    throw new InvalidUuidError(`${ ValueValidationMessages.VALUE_IS_NOT_UUID } (workshopExecutionId)}: ${ workshopExecutionId }`);
  }

  if (!uuidValidate(mentorId)) {
    throw new InvalidUuidError(`${ ValueValidationMessages.VALUE_IS_NOT_UUID } (mentorId)}: ${ mentorId }`);
  }

  if (!uuidValidate(participantId)) {
    throw new InvalidUuidError(`${ ValueValidationMessages.VALUE_IS_NOT_UUID } (participantId)}: ${ participantId }`);
  }

  return { workshopExecutionId, mentorId, participantId };
};

const authorizeOperation = async (workshopExecutionId, participantId) => {
  const operation = WORKSHOP_OPERATION_NAMES.MENTOR_APPROVE_LEVEL;

  const { authorize } = await invokeLambda(
      AwsInfo.WORKSHOPS_OPERATIONS_AUTHORIZER,
      {
        operationName: operation,
        participantId: participantId,
        workshopExecutionId: workshopExecutionId
      });

  if (!authorize) {
    throw new NoPurchaseAllowedError(`Operation ${ operation } cannot be performed at this moment`);
  }
};

const processLevel = async (workshopExecutionId, participantId) => {
  const progress = await getParticipantProgress(participantId, workshopExecutionId);
  const currentActivity = await getCurrentActivity(workshopExecutionId, participantId);

  const newActivityLevel = progress.details.stats.currentActivity.level++;
  if (newActivityLevel > currentActivity.levels) {
    throw new InvalidRequestError(`Actividad en máximo nivel`);
  }

  const { entity, statement } = ParticipantProgressRepository.upsertStatement(progress);
  await execOnDatabase({ statement, parameters: entity });

  return {name: currentActivity.name, level: newActivityLevel};
};

const getParticipant = async (participantId) => {
  const [participant] = await ParticipantRepository.findById(participantId);
  if (!participant) {
    throw new InvalidRequestError(`Participant not found: ${ participantId }`);
  }
  return participant;
};

const getCurrentActivity = async (workshopExecutionId, participantId) => {
  const [progress] = await ParticipantProgressRepository.findCurrentActivityByParticipantIdAndWorkshopExecutionId(workshopExecutionId, participantId);
  if (!progress) {
    throw new InvalidRequestError(`Participant progress not found: ${ participantId }, ${ workshopExecutionId }`);
  }
  return progress;
};

const notifyEvent = async (workshopExecutionId, participant, newLevel) => {
  const participantName = participant.name;
  await messageQueue(AwsInfo.EVENT_REGISTRY_QUEUE, {
    workshopExecutionId,
    participantName,
    operationName: WORKSHOP_OPERATION_NAMES.MENTOR_APPROVE_LEVEL,
    newLevel: newLevel
  });
};


