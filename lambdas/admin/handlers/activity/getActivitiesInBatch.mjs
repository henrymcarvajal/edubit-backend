import { ActivityRepository } from '../../../../persistence/repositories/activityRepository.mjs';
import { HttpResponseCodes } from '../../../../commons/web/webResponses.mjs';
import { UserRoles } from '../../../users/handlers/enrollment/constants.mjs';

import { handleAdminError } from '../errorHandling.mjs';
import { sendResponse } from '../../../../util/responseHelper.mjs';

export const handle = async (event) => {

  const encodedIds = event.pathParameters.ids;
  const roles = event.requestContext.authorizer.claims.profile;

  let ids;
  try {
    ids = JSON.parse(decodeURIComponent(encodedIds));
  } catch (error) {
    return sendResponse(HttpResponseCodes.BAD_REQUEST, "Malformed input");
  }

  try {
    let activities;
    if (roles === UserRoles.ADMIN) {
      activities = await ActivityRepository.findByIdIn(ids);
    } else {
      activities = await ActivityRepository.findByIdInEnabled(ids);
    }

    return sendResponse(HttpResponseCodes.OK, activities);

  } catch (error) {
    console.log("Error on getActivitiesInBatch", error);
    return handleAdminError(error);
  }
};