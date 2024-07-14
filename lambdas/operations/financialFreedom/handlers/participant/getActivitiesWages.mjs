import { ActivityRepository } from '../../../../../persistence/repositories/activityRepository.mjs';
import { HttpResponseCodes } from '../../../../../commons/web/webResponses.mjs';
import { ValueValidationMessages } from '../../../../../commons/messages.mjs';
import { WagesRepository } from '../../../../../persistence/repositories/wageRepository.mjs';

import { authorizeAndFindMentor } from '../../../../members/authorizers/mentorAuthorizer.mjs';
import { authorizeAndFindParticipant } from '../../../../members/authorizers/participantAuthorizer.mjs';
import { getParticipantProgress } from '../../commons/getParticipantProgress.mjs';
import { handleErrorResponse } from '../../../../commons/errorHandling.mjs';
import { sendResponse } from '../../../../../util/responseHelper.mjs';
import { validate as uuidValidate } from 'uuid';

import { InvalidInputError } from '../../../../commons/errors/data/input.mjs';
import { WorkshopExecutionRepository } from '../../../../../persistence/repositories/workshopExecutionRepository.mjs';
import { ResourceNotFoundError } from '../../../../commons/errors/integrity/resources.mjs';

let ALL_WAGES;
let ALL_ACTIVITIES;

export const handle = async (event) => {
  try {
    const { workshopExecutionId, participantId } = validateAndExtractParams(event);
    await authorizeAndFindParticipant(event, participantId);

    const enrollment = await fetchParticipantEnrollment(workshopExecutionId, participantId);

    const activityWagesView = await createActivityWagesView(enrollment);

    return sendResponse(HttpResponseCodes.OK, activityWagesView);
  } catch (error) {
    return handleErrorResponse(error);
  }
};

const validateAndExtractParams = (event) => {
  const workshopExecutionId = event.pathParameters.workshopExecutionId;
  if (!uuidValidate(workshopExecutionId)) {
    throw new InvalidInputError(`${ ValueValidationMessages.VALUE_IS_NOT_UUID } (workshopExecutionId): ${ workshopExecutionId }`);
  }

  const participantId = event.pathParameters.participantId;
  if (!uuidValidate(participantId)) {
    throw new InvalidInputError(`${ ValueValidationMessages.VALUE_IS_NOT_UUID } (participantId): ${ participantId }`);
  }

  return { workshopExecutionId, participantId };
};

const fetchParticipantEnrollment = async (workshopExecutionId, participantId) => {
  const [workshopExecution] = await WorkshopExecutionRepository.findById(workshopExecutionId);
  if (!workshopExecution) {
    throw new ResourceNotFoundError(`WorkshopExecution not found: ${ workshopExecutionId }`);
  }

  const key = Object.keys(workshopExecution.participants).find(p => p === participantId);

  return workshopExecution.participants[key].activities;
};


const createActivityWagesView = async (enrollment) => {

  await initializeWages();
  await initializeActivities();

  const activityView = {};
  Object.values(enrollment).forEach(activityId => {
    activityView[activityId] = {};

    const activity = ALL_ACTIVITIES.find(activity => activity.id === activityId);
    activityView[activityId].name = activity.name;
    activityView[activityId].wages = {};

    const activityLevel = activity.levels;

    for (let i = 1; i <= activityLevel; i++) {
      const wage = ALL_WAGES.find(w => parseInt(w.description) === i);
      activityView[activityId].wages[`nivel${ i }`] = wage[`level${ activityLevel }`];
    }
  });

  return activityView;
};

const initializeWages = async () => {
  if (!ALL_WAGES) {
    ALL_WAGES = await WagesRepository.findAll();
  }
};

const initializeActivities = async () => {
  if (!ALL_ACTIVITIES) {
    ALL_ACTIVITIES = await ActivityRepository.findAll();
  }
};
