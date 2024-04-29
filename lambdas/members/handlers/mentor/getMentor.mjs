import { HttpResponseCodes } from '../../../../commons/web/webResponses.mjs';

import { authorizeAndFindMentor } from './mentorAuthorizer.mjs';
import { handleMembersError } from '../errorHandling.mjs';
import { sendResponse } from '../../../../util/lambdaHelper.mjs';

export const handle = async (event) => {

  const id = event.pathParameters.id;
  const {profile: roles, email} = event.requestContext.authorizer.claims;

  try {
    const {mentor: foundMentor, response} = await authorizeAndFindMentor(roles, id, email);
    if (response) return response;

    return sendResponse(HttpResponseCodes.OK, foundMentor);

  } catch (error) {
    return handleMembersError(error);
  }
};