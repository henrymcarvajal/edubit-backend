import { HttpResponseCodes } from '../../../../commons/web/webResponses.mjs';
import { ImprovementRepository } from '../../../../persistence/repositories/improvementRepository.mjs';
import { ValueValidationMessages } from '../../../../commons/messages.mjs';

import { handleAdminError } from '../errorHandling.mjs';
import { isUUID } from '../../../../commons/validations.mjs';
import { sendResponse } from '../../../../util/lambdaHelper.mjs';

export const handle = async (event) => {

  const id = event.pathParameters.id;
  if (!isUUID(id)) return sendResponse(HttpResponseCodes.BAD_REQUEST, {message: `${ValueValidationMessages.VALUE_IS_NOT_UUID}: ${id}`});

  try {
    const [improvement] = await ImprovementRepository.findById(id);
    if (!improvement) return sendResponse(HttpResponseCodes.NOT_FOUND);

    return sendResponse(HttpResponseCodes.OK, improvement);

  } catch (error) {
    return handleAdminError(error);
  }
};