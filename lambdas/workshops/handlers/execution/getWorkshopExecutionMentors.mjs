import { MentorRepository } from '../../../../persistence/repositories/mentorRepository.mjs';
import { ActivityRepository } from '../../../../persistence/repositories/activityRepository.mjs';
import { WorkshopExecutionRepository } from '../../../../persistence/repositories/workshopExecutionRepository.mjs';
import { HttpResponseCodes } from '../../../../commons/web/webResponses.mjs';
import { ValueValidationMessages } from '../../../../commons/messages.mjs';

import { handleErrorResponse } from '../../../commons/errorHandling.mjs';
import { sendResponse } from '../../../../util/responseHelper.mjs';
import { validate as uuidValidate } from 'uuid';

import { InvalidInputError } from '../../../commons/errors/data/input.mjs';

let ALL_ACTIVITIES;

export const handle = async (event) => {

  try {
    const workshopExecutionId = validateAndExtractParams(event);

    const [workshopExecution] = await WorkshopExecutionRepository.findById(workshopExecutionId);
    if (!workshopExecution) return sendResponse(HttpResponseCodes.NOT_FOUND);

    const mentorsView = await processActivities(workshopExecution.mentors);

    return sendResponse(HttpResponseCodes.OK, mentorsView);

  } catch (error) {
    return handleErrorResponse(error);
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

const validateAndExtractParams = (event) => {
  const workshopExecutionId = event.pathParameters.id;

  if (!uuidValidate(workshopExecutionId)) {
    throw new InvalidInputError(`${ ValueValidationMessages.VALUE_IS_NOT_UUID } (workshopExecutionId)}: ${ workshopExecutionId }`);
  }

  return workshopExecutionId;
};

const processActivities = async (mentors) => {

  await initializeActivities();

  const mappedMentors = {};

  const foundMentors = await MentorRepository.findByIdIn(Object.keys(mentors));

  for (let mentorId of Object.keys(mentors)) {

    const toActivity = (activityId) => {
      return {
        id: activityId,
        name: ALL_ACTIVITIES.find(activity => activity.id === activityId).name
      };
    };

    const activities = Object.values(mentors[mentorId].activities).map(toActivity);

    mappedMentors[mentorId] = {
      id: mentorId,
      name: foundMentors.find((m) => m.id === mentorId).name,
      activities: activities
    };
  }

  return Object.values(mappedMentors);
};