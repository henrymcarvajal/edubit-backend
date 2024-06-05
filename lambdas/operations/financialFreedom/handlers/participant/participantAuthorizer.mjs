import { HttpResponseCodes } from '../../../../../commons/web/webResponses.mjs';
import { ParticipantRepository } from '../../../../../persistence/repositories/participantRepository.mjs';
import { UserRoles } from '../../../../users/handlers/enrollment/constants.mjs';

import { sendResponse } from '../../../../../util/responseHelper.mjs';

export const authorizeAndFindParticipant = async (event, id) => {

  const { profile, email } = event.requestContext.authorizer.claims;

  let foundParticipant;
  let response;
  switch (profile) {
    case UserRoles.ADMIN:
      [foundParticipant] = await ParticipantRepository.findById(id);
      if (!foundParticipant) {
        response = sendResponse(HttpResponseCodes.NOT_FOUND, {message: `Participant not found: ${id}`});
      }
      break;
    case UserRoles.PARTICIPANT:
      [foundParticipant] = await ParticipantRepository.findByEmail(email);
      if (!foundParticipant || foundParticipant.id !== id) {
        response = sendResponse(HttpResponseCodes.FORBIDDEN);
      }
      break;
    default:
      response = sendResponse(HttpResponseCodes.FORBIDDEN);
      break;
  }

  return {participant: foundParticipant, response: response};
};