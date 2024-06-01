import { HttpResponseCodes } from '../../../../commons/web/webResponses.mjs';
import { InstitutionRepository } from '../../../../persistence/repositories/institutionRepository.mjs';
import { UserRoles } from '../../../users/handlers/enrollment/constants.mjs';

import { handleAdminError } from '../errorHandling.mjs';
import { sendResponse } from '../../../../util/responseHelper.mjs';

export const handle = async (event) => {

  try {

    const roles = event.requestContext.authorizer.claims.profile;

    let institutions;
    if (roles === UserRoles.ADMIN) {
      institutions = await InstitutionRepository.findAll();
    } else {
      institutions = await InstitutionRepository.findAllEnabled();
    }

    return sendResponse(HttpResponseCodes.OK, institutions);

  } catch (error) {
    return handleAdminError(error);
  }
};