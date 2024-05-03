import { HttpResponseCodes } from '../../../../commons/web/webResponses.mjs';
import { ValueValidationMessages } from '../../../../commons/messages.mjs';

import { authorizeAndFindMentor } from './mentorAuthorizer.mjs';
import { handleMembersError } from '../errorHandling.mjs';
import { isUUID } from '../../../../commons/validations.mjs';
import { sendResponse } from '../../../../util/lambdaHelper.mjs';

export const handle = async (event) => {

  const id = event.pathParameters.id;
  if (!isUUID(id)) return sendResponse(HttpResponseCodes.BAD_REQUEST, {message: `${ValueValidationMessages.VALUE_IS_NOT_UUID}: ${id}`});

  const {profile: roles, email} = event.requestContext.authorizer.claims;

  try {
    const {mentor: foundMentor, response} = await authorizeAndFindMentor(roles, id, email);
    if (response) return response;

    return sendResponse(HttpResponseCodes.OK, foundMentor);

  } catch (error) {
    return handleMembersError(error);
  }
};