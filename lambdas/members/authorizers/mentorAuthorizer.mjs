import { MentorRepository } from '../../../persistence/repositories/mentorRepository.mjs';
import { UserRoles } from '../../users/handlers/enrollment/constants.mjs';

import { ForbiddenOperationError } from '../../commons/errors/security/restrictedAccess.mjs';
import { ResourceNotFoundError } from '../../commons/errors/integrity/resources.mjs';

export const authorizeAndFindMentor = async (event, mentorId) => {

  let foundMentor;

  const { profile, email } = event.requestContext.authorizer.claims;
  switch (profile) {
    case UserRoles.ADMIN:
      [foundMentor] = await MentorRepository.findById(mentorId);
      if (!foundMentor) {
        throw new ResourceNotFoundError(`Mentor not found: ${ mentorId }`);
      }
      break;
    case UserRoles.MENTOR:
      [foundMentor] = await MentorRepository.findByEmail(email);
      if (!foundMentor || foundMentor.id !== mentorId) {
        throw new ForbiddenOperationError();
      }
      break;
    default:
      throw new ForbiddenOperationError();
  }

  return foundMentor;
};