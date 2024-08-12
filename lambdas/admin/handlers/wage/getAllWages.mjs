import { HttpResponseCodes } from '../../../../commons/web/webResponses.mjs';
import { UserRoles } from '../../../users/handlers/enrollment/constants.mjs';
import WagesRepository from '../../../../persistence/repositories/wageRepository.mjs';

import { handleErrorResponse } from '../../../commons/errorHandling.mjs';
import { sendResponse } from '../../../../util/responseHelper.mjs';

exports.handle = async (event) => {

  try {
    const roles = event.requestContext.authorizer.claims.profile;
    const wages = await getWages(roles);
    return sendResponse(HttpResponseCodes.OK, wages);
  } catch (error) {
    return handleErrorResponse(error);
  }
};

const getWages = async (roles) => {
  if (roles === UserRoles.ADMIN) {
    return  await WagesRepository.findAll();
  }
  return await WagesRepository.findAllEnabled();
}