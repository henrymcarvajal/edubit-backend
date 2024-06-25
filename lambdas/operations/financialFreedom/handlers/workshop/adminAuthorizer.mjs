import { HttpResponseCodes } from '../../../../../commons/web/webResponses.mjs';
import { UserRoles } from '../../../../users/handlers/enrollment/constants.mjs';

import { sendResponse } from '../../../../../util/responseHelper.mjs';

export const authorizeAdmin = async (event) => {

  const { profile } = event.requestContext.authorizer.claims;

  let response;

  switch (profile) {
    case UserRoles.ADMIN:
      break;
    default:
      response = sendResponse(HttpResponseCodes.FORBIDDEN);
      break;
  }

  return { response: response };
};