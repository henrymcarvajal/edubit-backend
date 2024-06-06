import { HttpResponseCodes } from '../../../../../commons/web/webResponses.mjs';
import { MentorRepository } from '../../../../../persistence/repositories/mentorRepository.mjs';
import { UserRoles } from '../../../../users/handlers/enrollment/constants.mjs';

import { sendResponse } from '../../../../../util/responseHelper.mjs';

export const authorizeAndFindMentor = async (event, id) => {

  const { profile, email } = event.requestContext.authorizer.claims;

  let foundMentor;
  let response;

  switch (profile) {
    case UserRoles.ADMIN:
      [foundMentor] = await MentorRepository.findById(id);
      if (!foundMentor) {
        response = sendResponse(HttpResponseCodes.NOT_FOUND, {message: `Mentor not found: ${id}`});
      }
      break;
    case UserRoles.MENTOR:
      [foundMentor] = await MentorRepository.findByEmail(email);
      if (!foundMentor || foundMentor.id !== id) {
        response = sendResponse(HttpResponseCodes.FORBIDDEN);
      }
      break;
    default:
      response = sendResponse(HttpResponseCodes.FORBIDDEN);
      break;
  }

  return {mentor: foundMentor, response: response};
};