import { ParticipantRepository } from '../../../persistence/repositories/participantRepository.mjs';
import { UserRoles } from '../../users/handlers/enrollment/constants.mjs';

import { ForbiddenOperationError } from '../../commons/errors/security/restrictedAccess.mjs';
import { ResourceNotFoundError } from '../../commons/errors/integrity/resources.mjs';

export const authorizeAndFindParticipant = async (event, participantId) => {

  let foundParticipant;

  const { profile, email } = event.requestContext.authorizer.claims;
  switch (profile) {
    case UserRoles.ADMIN:
      [foundParticipant] = await ParticipantRepository.findById(participantId);
      if (!foundParticipant) {
        throw new ResourceNotFoundError(`Participant not found: ${ participantId }`);
      }
      break;
    case UserRoles.PARTICIPANT:
      [foundParticipant] = await ParticipantRepository.findByEmail(email);
      if (!foundParticipant || foundParticipant.id !== participantId) {
        throw new ForbiddenOperationError();
      }
      break;
    default:
      throw new ForbiddenOperationError();
  }

  return foundParticipant;
};