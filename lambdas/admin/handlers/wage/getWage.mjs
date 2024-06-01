import { HttpResponseCodes } from '../../../../commons/web/webResponses.mjs';
import { ValueValidationMessages } from '../../../../commons/messages.mjs';
import { WagesRepository } from '../../../../persistence/repositories/wageRepository.mjs';

import { handleAdminError } from '../errorHandling.mjs';
import { sendResponse } from '../../../../util/responseHelper.mjs';
import { validate as uuidValidate } from 'uuid';

export const handle = async (event) => {

  const id = event.pathParameters.id;
  if (!uuidValidate(id)) return sendResponse(HttpResponseCodes.BAD_REQUEST, {message: `${ValueValidationMessages.VALUE_IS_NOT_UUID}: ${id}`});

  try {
    const [wage] = await WagesRepository.findById(id);
    if (!wage) return sendResponse(HttpResponseCodes.NOT_FOUND);

    return sendResponse(HttpResponseCodes.OK, wage);

  } catch (error) {
    return handleAdminError(error);
  }
};