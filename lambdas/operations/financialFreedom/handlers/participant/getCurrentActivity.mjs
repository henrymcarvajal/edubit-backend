import { ActivityRepository } from '../../../../../persistence/repositories/activityRepository.mjs';
import { HttpResponseCodes } from '../../../../../commons/web/webResponses.mjs';
import { ValueValidationMessages } from '../../../../../commons/messages.mjs';
import { WagesRepository } from '../../../../../persistence/repositories/wageRepository.mjs';

import { authorizeAndFindMentor } from '../../../../members/authorizers/mentorAuthorizer.mjs';
import { getParticipantProgress } from '../../commons/getParticipantProgress.mjs';
import { handleErrorResponse } from '../../../../commons/errorHandling.mjs';
import { sendResponse } from '../../../../../util/responseHelper.mjs';
import { validate as uuidValidate } from 'uuid';

import { InvalidInputError } from '../../../../commons/errors/data/input.mjs';

let ALL_WAGES;

export const handle = async (event) => {
  try {
    const { mentorId, participantId, workshopExecutionId } = validateAndExtractParams(event);
    await authorizeAndFindMentor(event, mentorId);

    const progress = await getParticipantProgress(participantId, workshopExecutionId);
    const currentActivityView = await createActivityView(progress.details);

    return sendResponse(HttpResponseCodes.OK, currentActivityView);
  } catch (error) {
    return handleErrorResponse(error);
  }
};

const validateAndExtractParams = (event) => {
  const mentorId = event.headers.mentorid; // AWS lowercases all headers' names
  if (!uuidValidate(mentorId)) {
    throw new InvalidInputError(`${ ValueValidationMessages.VALUE_IS_NOT_UUID } (mentorId)}: ${ mentorId }`);
  }

  const workshopExecutionId = event.pathParameters.workshopExecutionId;
  if (!uuidValidate(workshopExecutionId)) {
    throw new InvalidInputError(`${ ValueValidationMessages.VALUE_IS_NOT_UUID } (workshopExecutionId): ${ workshopExecutionId }`);
  }

  const participantId = event.pathParameters.participantId;
  if (!uuidValidate(participantId)) {
    throw new InvalidInputError(`${ ValueValidationMessages.VALUE_IS_NOT_UUID } (participantId): ${ participantId }`);
  }

  return { mentorId, participantId, workshopExecutionId };
};

const createActivityView = async (details) => {

  await initializeWages();

  const { stats } = details;

  const [currentActivity] = await ActivityRepository.findById(stats.currentActivity.id);

  const wage = ALL_WAGES.find(wage => wage.description === currentActivity.levels);

  return {
    id: stats.currentActivity.id,
    level: stats.currentActivity.level,
    supportMaterial: currentActivity.supportMaterial,
    activitySolution: currentActivity.activitySolution,
    wage: wage[`level${ stats.currentActivity.level }`]
  };
}

const initializeWages = async () => {
  if (!ALL_WAGES) {
    ALL_WAGES = (await WagesRepository.findAll());
  }
};