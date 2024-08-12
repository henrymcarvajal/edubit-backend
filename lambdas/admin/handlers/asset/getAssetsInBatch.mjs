import AssetRepository from '../../../../persistence/repositories/assetRepository.mjs';
import { HttpResponseCodes } from '../../../../commons/web/webResponses.mjs';
import { UserRoles } from '../../../users/handlers/enrollment/constants.mjs';

import { handleErrorResponse } from '../../../commons/errorHandling.mjs';
import { sendResponse } from '../../../../util/responseHelper.mjs';

exports.handle = async (event) => {

  const encodedIds = event.pathParameters.ids;
  const roles = event.requestContext.authorizer.claims.profile;

  let ids;
  try {
    ids = JSON.parse(decodeURIComponent(encodedIds));
  } catch (error) {
    return sendResponse(HttpResponseCodes.BAD_REQUEST, "Malformed input");
  }

  try {
    let assets;
    if (roles === UserRoles.ADMIN) {
      assets = await AssetRepository.findByIdIn(ids);
    } else {
      assets = await AssetRepository.findByIdInAndEnabled(ids);
    }

    return sendResponse(HttpResponseCodes.OK, assets);

  } catch (error) {
    console.log("Error on getActivitiesInBatch", error);
    return handleErrorResponse(error);
  }
};