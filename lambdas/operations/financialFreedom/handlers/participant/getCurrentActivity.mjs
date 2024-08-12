import ActivityRepository from '../../../../../persistence/repositories/activityRepository.mjs';
import WagesRepository from '../../../../../persistence/repositories/wageRepository.mjs';
import { HttpResponseCodes } from '../../../../../commons/web/webResponses.mjs';
import { ValueValidationMessages } from '../../../../../commons/messages.mjs';

import { authorizeAndFindMentor } from '../../../../members/authorizers/mentorAuthorizer.mjs';
import { authorizeAndFindParticipant } from '../../../../members/authorizers/participantAuthorizer.mjs';
import { getParticipantProgress } from '../../commons/getParticipantProgress.mjs';
import { handleErrorResponse } from '../../../../commons/errorHandling.mjs';
import { sendResponse } from '../../../../../util/responseHelper.mjs';
import { validate as uuidValidate } from 'uuid';

import { InvalidInputError } from '../../../../commons/errors/data/input.mjs';

let ALL_WAGES;

exports.handle = async (event) => {
  try {
    const { view, mentorId, participantId, workshopExecutionId } = validateAndExtractParams(event);
    if (viewIsMentor(view)) {
      await authorizeAndFindMentor(event, mentorId);
    } else {
      await authorizeAndFindParticipant(event, participantId);
    }

    const progress = await getParticipantProgress(participantId, workshopExecutionId);
    const currentActivityView = await createActivityView(progress.details.currentActivity, view);

    return sendResponse(HttpResponseCodes.OK, currentActivityView);
  } catch (error) {
    return handleErrorResponse(error);
  }
};

const validateAndExtractParams = (event) => {
  const view = event.queryStringParameters?.view;
  if (!view) {
    throw new InvalidInputError(`Falta valor de vista`);
  }

  let mentorId;
  if (viewIsMentor(view)) {
    mentorId = event.headers.mentorid; // AWS lowercases all headers' names
    if (!uuidValidate(mentorId)) {
      throw new InvalidInputError(`${ ValueValidationMessages.VALUE_IS_NOT_UUID } (mentorId)}: ${ mentorId }`);
    }
  }

  const workshopExecutionId = event.pathParameters.workshopExecutionId;
  if (!uuidValidate(workshopExecutionId)) {
    throw new InvalidInputError(`${ ValueValidationMessages.VALUE_IS_NOT_UUID } (workshopExecutionId): ${ workshopExecutionId }`);
  }

  const participantId = event.pathParameters.participantId;
  if (!uuidValidate(participantId)) {
    throw new InvalidInputError(`${ ValueValidationMessages.VALUE_IS_NOT_UUID } (participantId): ${ participantId }`);
  }

  return { view, mentorId, participantId, workshopExecutionId };
};

const viewIsMentor = (view) => view.toLowerCase() === 'mentor';

const createActivityView = async (currentActivity, view) => {
  const [foundActivity] = await ActivityRepository.findById(currentActivity.id);
  return await buildView(currentActivity, foundActivity, view);
};

const buildView = async (currentActivity, foundActivity, view) => {
  await initializeWages();

  const wage = ALL_WAGES.find(wage => wage.maxLevels === foundActivity.levels);

  const activityView = {
    id: currentActivity.id,
    level: currentActivity.level,
    description: foundActivity.description,
    name: foundActivity.name,
    supportMaterial: foundActivity.supportMaterial,
    wage: wage[`level${ currentActivity.level }`]
  };

  if (viewIsMentor(view)) {
    activityView.activitySolution = foundActivity.activitySolution;
  }

  return activityView;
};

const initializeWages = async () => {
  if (!ALL_WAGES) {
    ALL_WAGES = (await WagesRepository.findAll());
  }
};