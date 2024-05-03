import { HttpResponseCodes } from '../../../../commons/web/webResponses.mjs';
import { WorkshopExecutionRepository } from '../../../../persistence/repositories/workshopExecutionRepository.mjs';
import { ValueValidationMessages } from '../../../../commons/messages.mjs';

import { isUUID } from '../../../../commons/validations.mjs';
import { sendErrorResponse, sendResponse } from '../../../../util/lambdaHelper.mjs';

export const handle = async (event) => {

  const id = event.pathParameters.id;
  if (!isUUID(id)) return sendResponse(HttpResponseCodes.BAD_REQUEST, {message: `${ValueValidationMessages.VALUE_IS_NOT_UUID}: ${id}`});

  try {

    const [workshopExecution] = await WorkshopExecutionRepository.findById(id);

    if (!workshopExecution) {
      return sendResponse(HttpResponseCodes.NOT_FOUND);
    }

    return sendResponse(HttpResponseCodes.OK, workshopExecution);

  } catch (error) {
    return sendErrorResponse(HttpResponseCodes.INTERNAL_SERVER_ERROR, error);
  }
};