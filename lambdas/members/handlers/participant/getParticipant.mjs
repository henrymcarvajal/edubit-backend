import { HttpResponseCodes } from '../../../../commons/web/webResponses.mjs';

import { authorizeAndFindParticipant } from './participantAuthorizer.mjs';
import { handleMembersError } from '../errorHandling.mjs';
import { sendResponse } from '../../../../util/lambdaHelper.mjs';

export const handle = async (event) => {

  const id = event.pathParameters.id;
  const {profile: roles, email} = event.requestContext.authorizer.claims;

  try {
    const {participant: foundParticipant, response} = await authorizeAndFindParticipant(roles, id, email);
    if (response) return response;

    return sendResponse(HttpResponseCodes.OK, foundParticipant);

  } catch (error) {
    return handleMembersError(error);
  }
};