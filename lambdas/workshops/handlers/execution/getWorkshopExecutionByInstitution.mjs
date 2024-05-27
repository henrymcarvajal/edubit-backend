import { HttpResponseCodes } from '../../../../commons/web/webResponses.mjs';
import { WorkshopExecutionRepository } from '../../../../persistence/repositories/workshopExecutionRepository.mjs';
import { ValueValidationMessages } from '../../../../commons/messages.mjs';

import { sendErrorResponse, sendResponse } from '../../../../util/lambdaHelper.mjs';
import { validate as uuidValidate } from 'uuid';

export const handle = async (event) => {

  const id = event.pathParameters.id;
  if (!uuidValidate(id)) return sendResponse(HttpResponseCodes.BAD_REQUEST, {message: `${ValueValidationMessages.VALUE_IS_NOT_UUID}: ${id}`});

  try {
    const workshopExecutions = await WorkshopExecutionRepository.findByInstitutionId(id);
    return sendResponse(HttpResponseCodes.OK, workshopExecutions);
   } catch (error) {
    return sendErrorResponse(HttpResponseCodes.INTERNAL_SERVER_ERROR, error);
  }
};