import { AssetRepository } from '../../../../persistence/repositories/assetRepository.mjs';
import { HttpResponseCodes } from '../../../../commons/web/webResponses.mjs';
import { UserRoles } from '../../../users/handlers/enrollment/constants.mjs';

import { handleAdminError } from '../errorHandling.mjs';
import { sendResponse } from '../../../../util/responseHelper.mjs';

export const handle = async (event) => {

  const roles = event.requestContext.authorizer.claims.profile;

  try {
    let assets;
    if (roles === UserRoles.ADMIN) {
      assets = await AssetRepository.findAll();
    } else {
      assets = await AssetRepository.findAllEnabled();
    }

    return sendResponse(HttpResponseCodes.OK, assets);

  } catch (error) {
    return handleAdminError(error);
  }
};