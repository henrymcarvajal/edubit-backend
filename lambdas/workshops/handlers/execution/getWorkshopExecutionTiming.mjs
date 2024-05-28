import { HttpResponseCodes } from '../../../../commons/web/webResponses.mjs';
import { ValueValidationMessages } from '../../../../commons/messages.mjs';
import { WorkshopExecutionRepository } from '../../../../persistence/repositories/workshopExecutionRepository.mjs';

import { sendErrorResponse, sendResponse } from '../../../../util/lambdaHelper.mjs';
import { validate as uuidValidate } from 'uuid';

export const handle = async (event) => {

  const id = event.pathParameters.id;
  if (!uuidValidate(id)) return sendResponse(HttpResponseCodes.BAD_REQUEST, { message: `${ ValueValidationMessages.VALUE_IS_NOT_UUID }: ${ id }` });

  try {
    const [workshopExecution] = await WorkshopExecutionRepository.findScheduleById(id);
    if (!workshopExecution) {
      return sendResponse(HttpResponseCodes.NOT_FOUND);
    }

    const timing = getWorkshopExecutionTiming(workshopExecution);

    return sendResponse(HttpResponseCodes.OK, timing);
  } catch (error) {
    return sendErrorResponse(HttpResponseCodes.INTERNAL_SERVER_ERROR, error);
  }
};

export const getWorkshopExecutionTiming = (workshopExecution) => {

  let currentPhase;
  let nextPhase;
  let sumUp = 0;
  let entries = Object.entries(workshopExecution.schedule);
  for (let i = 0; i < entries.length; i++) {
    sumUp += entries[i][1].duration;
    if (sumUp >= workshopExecution.elapsedTime) {
      currentPhase = workshopExecution.schedule[entries[i][0]];
      if (i + 1 < entries.length) {
        nextPhase = workshopExecution.schedule[entries[i + 1][0]];
      } else {
        nextPhase = { description: 'End of event' };
      }
      break;
    }
  }

  return {
    currentPhase: currentPhase,
    nextPhase: nextPhase,
    nextPhaseInMinutes: sumUp - workshopExecution.elapsedTime,
    elapsedTime: workshopExecution.elapsedTime,
    remainingTime: workshopExecution.remainingTime
  };
};