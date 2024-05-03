import { HttpResponseCodes } from '../../../../commons/web/webResponses.mjs';
import { InstitutionRepository } from '../../../../persistence/repositories/institutionRepository.mjs';
import { ValueValidationMessages } from '../../../../commons/messages.mjs';

import { handleAdminError } from '../errorHandling.mjs';
import { isUUID } from '../../../../commons/validations.mjs';
import { sendResponse } from '../../../../util/lambdaHelper.mjs';

export const handle = async (event) => {

  const id = event.pathParameters.id;
  if (!isUUID(id)) return sendResponse(HttpResponseCodes.BAD_REQUEST, {message: `${ValueValidationMessages.VALUE_IS_NOT_UUID}: ${id}`});

  try {
    const [institution] = await InstitutionRepository.findById(id);
    if (!institution) return sendResponse(HttpResponseCodes.NOT_FOUND);

    return sendResponse(HttpResponseCodes.OK, institution);

  } catch (error) {
    return handleAdminError(error);
  }
};