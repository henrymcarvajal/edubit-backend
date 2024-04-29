import { UserRepository } from '../../../../persistence/repositories/userRepository.mjs';
import { GeneralUserMessages } from '../enrollment/validations/messages.mjs';

import { UserNotAuthorizedError, UserNotRegisteredError } from './error.mjs';

export const authorize = async (email, role) => {

  const authenticatedUser = await UserRepository.findByEmail('email', email);

  if (!authenticatedUser) {
    throw new UserNotRegisteredError(GeneralUserMessages.USER_NOT_REGISTERED + `: ${email}`);
  }

  if (authenticatedUser.roles !== role) {
    throw new UserNotAuthorizedError(GeneralUserMessages.USER_NOT_AUTHORIZED_FOR_OPERATION);
  }

  return authenticatedUser;
};