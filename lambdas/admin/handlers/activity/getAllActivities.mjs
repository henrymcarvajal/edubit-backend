import { ActivityRepository } from '../../../../persistence/repositories/activityRepository.mjs';
import { HttpResponseCodes } from '../../../../commons/web/webResponses.mjs';
import { UserRoles } from '../../../users/handlers/enrollment/constants.mjs';

import { handleAdminError } from '../errorHandling.mjs';
import { sendResponse } from '../../../../util/responseHelper.mjs';

export const handle = async (event) => {

  const roles = event.requestContext.authorizer.claims.profile;

  try {
    let activities;
    if (roles === UserRoles.ADMIN) {
      activities = await ActivityRepository.findAll();
    } else {
      activities = await ActivityRepository.findAllEnabled();
    }

    return sendResponse(HttpResponseCodes.OK, activities);

  } catch (error) {
    return handleAdminError(error);
  }
};