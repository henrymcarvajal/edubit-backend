import { ActivityRepository } from '../../../../persistence/repositories/activityRepository.mjs';
import { HttpResponseCodes } from '../../../../commons/web/webResponses.mjs';
import { ValueValidationMessages } from '../../../../commons/messages.mjs';

import { handleAdminError } from '../errorHandling.mjs';
import { sendResponse } from '../../../../util/responseHelper.mjs';
import { validate as uuidValidate } from 'uuid';

export const handle = async (event) => {

  const id = event.pathParameters.id;
  if (!uuidValidate(id)) return sendResponse(HttpResponseCodes.BAD_REQUEST, {message: `${ValueValidationMessages.VALUE_IS_NOT_UUID}: ${id}`});

  try {
    const [activity] = await ActivityRepository.findById(id);
    if (!activity) return sendResponse(HttpResponseCodes.NOT_FOUND);

    return sendResponse(HttpResponseCodes.OK, activity);

  } catch (error) {
    return handleAdminError(error);
  }
};