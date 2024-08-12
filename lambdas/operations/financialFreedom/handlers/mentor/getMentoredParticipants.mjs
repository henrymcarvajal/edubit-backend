import ActivityRepository from '../../../../../persistence/repositories/activityRepository.mjs';
import ParticipantProgressRepository from '../../../../../persistence/repositories/participantProgressRepository.mjs';
import WorkshopExecutionRepository from '../../../../../persistence/repositories/workshopExecutionRepository.mjs';
import { HttpResponseCodes } from '../../../../../commons/web/webResponses.mjs';
import { ValueValidationMessages } from '../../../../../commons/messages.mjs';

import { authorizeAndFindMentor } from '../../../../members/authorizers/mentorAuthorizer.mjs';
import { handleErrorResponse } from '../../../../commons/errorHandling.mjs';
import { sendResponse } from '../../../../../util/responseHelper.mjs';
import { validate as uuidValidate } from 'uuid';

import { InvalidInputError } from '../../../../commons/errors/data/input.mjs';
import { ResourceNotFoundError } from '../../../../commons/errors/integrity/resources.mjs';

let ALL_ACTIVITIES;
exports.handle = async (event) => {
  try {

    const { workshopExecutionId, mentorId } = validateAndExtractParams(event);

    await authorizeAndFindMentor(event, mentorId);

    const workshopExecution = await fetchWorkshopExecution(workshopExecutionId);
    checkMentorEnrollment(workshopExecution.mentors, mentorId);
    const participantsPerActivity = await processParticipantsProgress(workshopExecution, mentorId);

    return sendResponse(HttpResponseCodes.OK, participantsPerActivity);
  } catch (error) {
    return handleErrorResponse(error);
  }
};

const validateAndExtractParams = (event) => {
  const workshopExecutionId = event.pathParameters.workshopExecutionId;
  if (!uuidValidate(workshopExecutionId)) {
    throw new InvalidInputError(`${ ValueValidationMessages.VALUE_IS_NOT_UUID } (workshopExecutionId)}: ${ workshopExecutionId }`);
  }

  const mentorId = event.pathParameters.mentorId;
  if (!uuidValidate(mentorId)) {
    throw new InvalidInputError(`${ ValueValidationMessages.VALUE_IS_NOT_UUID } (mentorId)}: ${ mentorId }`);
  }

  return { workshopExecutionId, mentorId };
};

const fetchWorkshopExecution = async (workshopExecutionId) => {
  const [workshopExecution] = await WorkshopExecutionRepository.findById(workshopExecutionId);
  if (!workshopExecution) {
    throw new ResourceNotFoundError(`Workshop execution not found: ${ workshopExecutionId } `);
  }
  return workshopExecution;
};

const checkMentorEnrollment = (mentors, mentorId) => {
  const mentorKey = Object.keys(mentors).find(k => k === mentorId);
  if (!mentorKey) {
    throw new ResourceNotFoundError(`Mentor not enrolled: ${ mentorId } `);
  }
};

const processParticipantsProgress = async (workshopExecution, mentorId) => {

  await initializeActivities();

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

      participantsPerActivity[activityId].participants.push(
          { name: progress.name, id: progress.id, level: progress.details.stats.currentActivity.level }
      );
    }
  }

  return Object.values(participantsPerActivity);
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

