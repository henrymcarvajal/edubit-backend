import ActivityRepository from '../../../../../persistence/repositories/activityRepository.mjs';
import WagesRepository from '../../../../../persistence/repositories/wageRepository.mjs';
import WorkshopExecutionRepository from '../../../../../persistence/repositories/workshopExecutionRepository.mjs';
import { HttpResponseCodes } from '../../../../../commons/web/webResponses.mjs';
import { ValueValidationMessages } from '../../../../../commons/messages.mjs';

import { arrayIsEmpty } from '../../../../../util/arrays.mjs';
import { authorizeAndFindParticipant } from '../../../../members/authorizers/participantAuthorizer.mjs';
import { handleErrorResponse } from '../../../../commons/errorHandling.mjs';
import { sendResponse } from '../../../../../util/responseHelper.mjs';
import { validate as uuidValidate } from 'uuid';

import { InvalidInputError } from '../../../../commons/errors/data/input.mjs';
import { ResourceNotFoundError } from '../../../../commons/errors/integrity/resources.mjs';

const ALL_WAGES = [];
const ALL_ACTIVITIES = [];

exports.handle = async (event) => {
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

    const wage = ALL_WAGES.find(w => w.maxLevels === activityLevel);
    for (let i = 1; i <= activityLevel; i++) {
      activityView[activityId].wages[`nivel_${ i }`] = wage[`level${ i }`];
    }
  });

  return activityView;
};

const initializeWages = async () => {
  if (arrayIsEmpty(ALL_WAGES)) {
    ALL_WAGES.push(... await WagesRepository.findAll());
  }
};

const initializeActivities = async () => {
  if (arrayIsEmpty(ALL_ACTIVITIES)) {
    ALL_ACTIVITIES.push(... await ActivityRepository.findAll());
  }
};
