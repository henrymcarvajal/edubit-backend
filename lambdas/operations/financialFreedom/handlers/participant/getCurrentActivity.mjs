import { HttpResponseCodes } from '../../../../../commons/web/webResponses.mjs';
import { ValueValidationMessages } from '../../../../../commons/messages.mjs';

import { authorizeAndFindMentor } from '../mentor/mentorAuthorizer.mjs';
import { handleError } from '../errorHandling.mjs';
import { sendResponse } from '../../../../../util/responseHelper.mjs';
import { validate as uuidValidate } from 'uuid';
import { getParticipantProgress } from './participanProgress.mjs';

import { InvalidUuidError } from '../../../../commons/validations/error.mjs';
import { ActivityRepository } from '../../../../../persistence/repositories/activityRepository.mjs';

export const handle = async (event) => {

  try {

    const { mentorId, participantId, workshopExecutionId } = validateAndExtractParams(event);
    const { response } = await authorizeAndFindMentor(event, mentorId);
    if (response) return response;

    const progress = await getParticipantProgress(participantId, workshopExecutionId);

    const { stats } = progress.details;

    const [currentActivity] = await ActivityRepository.findById(stats.currentActivity.id);

    const currentActivityView = {
      id: stats.currentActivity.id,
      level:stats.currentActivity.level,
      supportMaterial: currentActivity.supportMaterial
    };

    return sendResponse(HttpResponseCodes.OK, currentActivityView);

  } catch (error) {
    return handleError(error);
  }
};

const validateAndExtractParams = (event) => {

  const mentorId = event.headers.mentorid; // AWS lowercases all headers' names
  const workshopExecutionId = event.pathParameters.workshopExecutionId;
  const participantId = event.pathParameters.participantId;

  if (!uuidValidate(mentorId)) {
    throw new InvalidUuidError(`${ ValueValidationMessages.VALUE_IS_NOT_UUID } (mentorId)}: ${ mentorId }`);
  }

  if (!uuidValidate(workshopExecutionId)) {
    throw new InvalidUuidError(`${ ValueValidationMessages.VALUE_IS_NOT_UUID } (workshopExecutionId): ${ workshopExecutionId }`);
  }

  if (!uuidValidate(participantId)) {
    throw new InvalidUuidError(`${ ValueValidationMessages.VALUE_IS_NOT_UUID } (participantId): ${ participantId }`);
  }

  return { mentorId, participantId, workshopExecutionId };
};