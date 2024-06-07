import { ActivityRepository } from '../../../../../persistence/repositories/activityRepository.mjs';
import { HttpResponseCodes } from '../../../../../commons/web/webResponses.mjs';
import { WorkshopExecutionRepository } from '../../../../../persistence/repositories/workshopExecutionRepository.mjs';
import {
  ParticipantProgressRepository
} from '../../../../../persistence/repositories/participantProgressRepository.mjs';
import { ValueValidationMessages } from '../../../../../commons/messages.mjs';

import { authorizeAndFindMentor } from './mentorAuthorizer.mjs';
import { handleError } from '../errorHandling.mjs';
import { sendResponse } from '../../../../../util/responseHelper.mjs';
import { validate as uuidValidate } from 'uuid';

import { InvalidUuidError } from '../../../../commons/validations/error.mjs';

let ALL_ACTIVITIES;
export const handle = async (event) => {
  try {

    await initializeImprovements();

    const { workshopExecutionId, mentorId } = validateAndExtractParams(event);

    const { response } = await authorizeAndFindMentor(event, mentorId);
    if (response) return response;

    const [workshopExecution] = await WorkshopExecutionRepository.findById(workshopExecutionId);

    const mentorKey = Object.keys(workshopExecution.mentors).find(k => k === mentorId);
    if (!mentorKey) return sendResponse(HttpResponseCodes.NOT_FOUND, mentorId);

    const participantsPerActivity = await processParticipantsProgress(workshopExecution, mentorId);

    return sendResponse(HttpResponseCodes.OK, participantsPerActivity);
  } catch (error) {
    return handleError(error);
  }
};

const initializeImprovements = async () => {
  if (!ALL_ACTIVITIES) {
    ALL_ACTIVITIES = (await ActivityRepository.findAll()).map(toView);
  }
};

const toView = (activity) => ({
  id: activity.id,
  name: activity.name
});

const processParticipantsProgress = async (workshopExecution, mentorId) => {
  const mentor = workshopExecution.mentors[mentorId];

  const participantProgresses = await ParticipantProgressRepository.findByWorkshopExecutionIdWithParticipantView(workshopExecution.id);

  const participantsPerActivity = {};

  const mentorActivities = Object.values(mentor.activities);

  for (const progress of participantProgresses) {
    const activityId = mentorActivities.find(a => a === progress.details.stats.currentActivity.id);
    if (activityId) {

      if (!participantsPerActivity[activityId]) {
        participantsPerActivity[activityId] = {
          id: activityId,
          name: ALL_ACTIVITIES.find(a => a.id === activityId).name,
          participants: []
        };
      }

      participantsPerActivity[activityId].participants.push({ name: progress.name, id: progress.id });
    }
  }

  return Object.values(participantsPerActivity);
};

const validateAndExtractParams = (event) => {
  const workshopExecutionId = event.pathParameters.workshopExecutionId;
  const mentorId = event.pathParameters.mentorId;

  if (!uuidValidate(workshopExecutionId)) {
    throw new InvalidUuidError(`${ ValueValidationMessages.VALUE_IS_NOT_UUID } (workshopExecutionId)}: ${ workshopExecutionId }`);
  }

  if (!uuidValidate(mentorId)) {
    throw new InvalidUuidError(`${ ValueValidationMessages.VALUE_IS_NOT_UUID } (mentorId)}: ${ mentorId }`);
  }

  return { workshopExecutionId, mentorId };
};
