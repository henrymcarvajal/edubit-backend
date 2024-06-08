import { ActivityRepository } from '../../../../../persistence/repositories/activityRepository.mjs';
import { HttpResponseCodes } from '../../../../../commons/web/webResponses.mjs';
import { ValueValidationMessages } from '../../../../../commons/messages.mjs';
import { WorkshopExecutionRepository } from '../../../../../persistence/repositories/workshopExecutionRepository.mjs';

import { handleError } from '../errorHandling.mjs';
import { sendResponse } from '../../../../../util/responseHelper.mjs';
import { validate as uuidValidate } from 'uuid';

import { InvalidUuidError, ReferenceNotFoundError } from '../../../../commons/validations/error.mjs';
import { MentorRepository } from '../../../../../persistence/repositories/mentorRepository.mjs';

let ALL_ACTIVITIES;
let ALL_MENTORS;

export const handle = async (event) => {

  try {

    await initializeActivities();
    await initializeMentors();

    const { workshopExecutionId, participantId } = validateAndExtractParams(event);

    const workshopExecution = await getWorkshopExecution(workshopExecutionId);

    const mentorEntries = Object.entries(workshopExecution.mentors);
    const activities = Object.entries(workshopExecution.participants[participantId].activities);

    const mentorsView = getMentorsView(activities, mentorEntries);

    return sendResponse(HttpResponseCodes.OK, mentorsView);

  } catch (error) {
    return handleError(error);
  }
};

const initializeActivities = async () => {
  const toView = (activity) => ({
    id: activity.id,
    name: activity.name
  });

  if (!ALL_ACTIVITIES) {
    ALL_ACTIVITIES = (await ActivityRepository.findAll()).map(toView);
  }
};

const initializeMentors = async () => {
  const toView = (mentor) => ({
    id: mentor.id,
    name: mentor.name
  });

  if (!ALL_MENTORS) {
    ALL_MENTORS = (await MentorRepository.findAll()).map(toView);
  }
};

const validateAndExtractParams = (event) => {

  const workshopExecutionId = event.pathParameters.workshopExecutionId;
  const participantId = event.pathParameters.participantId;

  if (!uuidValidate(workshopExecutionId)) {
    throw new InvalidUuidError(`${ ValueValidationMessages.VALUE_IS_NOT_UUID } (workshopExecutionId): ${ workshopExecutionId }`);
  }

  if (!uuidValidate(participantId)) {
    throw new InvalidUuidError(`${ ValueValidationMessages.VALUE_IS_NOT_UUID } (participantId) : ${ participantId }`);
  }

  return { workshopExecutionId, participantId };
};

const getWorkshopExecution = async (workshopExecutionId) => {
  const [workshopExecution] = await WorkshopExecutionRepository.findById(workshopExecutionId);
  if (!workshopExecution) {
    throw new ReferenceNotFoundError(`WorkshopExecution ${ workshopExecutionId } not found`);
  }

  return workshopExecution;
};

const getMentorsView = (activities, mentorEntries) => {
  const mentorsView = {};
  for (let activityEntry of activities) {
    const mentor = mentorEntries.find(e => Object.values(e[1].activities).includes(activityEntry[1]));
    if (mentor) {
      const mentorProp = {
        id: mentor[0],
        name: ALL_MENTORS.find(m => m.id === mentor[0]).name
      };

      mentorsView[activityEntry[0]] = {
        id: activityEntry[1],
        name: ALL_ACTIVITIES.find(a => a.id === activityEntry[1]).name,
        mentor: mentorProp
      };
    }
  }

  return mentorsView;
};