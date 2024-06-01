import { HttpResponseCodes } from '../../../../commons/web/webResponses.mjs';
import { ImprovementRepository } from '../../../../persistence/repositories/improvementRepository.mjs';
import { UserRoles } from '../../../users/handlers/enrollment/constants.mjs';

import { handleAdminError } from '../errorHandling.mjs';
import { sendResponse } from '../../../../util/responseHelper.mjs';

export const handle = async (event) => {

  const roles = event.requestContext.authorizer.claims.profile;

  try {
    let improvements;
    if (roles === UserRoles.ADMIN) {
      improvements = await ImprovementRepository.findAll();
    } else {
      improvements = await ImprovementRepository.findAllEnabled();
    }

    return sendResponse(HttpResponseCodes.OK, improvements);

  } catch (error) {
    return handleAdminError(error);
  }
};