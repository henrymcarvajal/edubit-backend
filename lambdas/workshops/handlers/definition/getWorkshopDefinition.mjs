import { HttpResponseCodes } from '../../../../commons/web/webResponses.mjs';
import { ValueValidationMessages } from '../../../../commons/messages.mjs';
import { WorkshopDefinitionRepository } from '../../../../persistence/repositories/workshopDefinitionRepository.mjs';

import { sendResponse } from '../../../../util/responseHelper.mjs';
import { validate as uuidValidate } from 'uuid';

export const handle = async (event) => {

  const id = event.pathParameters.id;
  if (!uuidValidate(id)) return sendResponse(HttpResponseCodes.BAD_REQUEST, {message: `${ValueValidationMessages.VALUE_IS_NOT_UUID}: ${id}`});

  try {

    const [workshop] = await WorkshopDefinitionRepository.findById(id);

    if (!workshop) {
      return sendResponse(HttpResponseCodes.NOT_FOUND);
    }

    return sendResponse(HttpResponseCodes.OK, workshop);

  } catch (error) {
    return sendResponse(HttpResponseCodes.INTERNAL_SERVER_ERROR, error, true);
  }
};