import { HttpResponseCodes } from '../../../../commons/web/webResponses.mjs';
import { UserRoles } from '../../../users/handlers/enrollment/constants.mjs';
import { WagesRepository } from '../../../../persistence/repositories/wageRepository.mjs';

import { handleAdminError } from '../errorHandling.mjs';
import { sendResponse } from '../../../../util/responseHelper.mjs';

export const handle = async (event) => {

  try {
    const roles = event.requestContext.authorizer.claims.profile;
    const wages = await getWages(roles);
    return sendResponse(HttpResponseCodes.OK, wages);
  } catch (error) {
    return handleAdminError(error);
  }
};

const getWages = async (roles) => {
  if (roles === UserRoles.ADMIN) {
    return  await WagesRepository.findAll();
  }
  return await WagesRepository.findAllEnabled();
}