import { HttpResponseCodes } from '../../../../commons/web/webResponses.mjs';
import { ValueValidationMessages } from '../../../../commons/messages.mjs';
import { WorkshopExecutionRepository } from '../../../../persistence/repositories/workshopExecutionRepository.mjs';

import { calculateTiming } from './calculateWorkshopTiming.mjs';
import { sendResponse } from '../../../../util/responseHelper.mjs';
import { validate as uuidValidate } from 'uuid';

export const handle = async (event) => {

  const id = event.pathParameters.id;
  if (!uuidValidate(id)) return sendResponse(HttpResponseCodes.BAD_REQUEST, { message: `${ ValueValidationMessages.VALUE_IS_NOT_UUID }: ${ id }` });

  try {
    const [workshopExecution] = await WorkshopExecutionRepository.findScheduleById(id);
    if (!workshopExecution) {
      return sendResponse(HttpResponseCodes.NOT_FOUND);
    }

    const timing = calculateTiming(workshopExecution);

    return sendResponse(HttpResponseCodes.OK, timing);
  } catch (error) {
    return sendResponse(HttpResponseCodes.INTERNAL_SERVER_ERROR, error, true);
  }
};