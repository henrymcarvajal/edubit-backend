import { UserRoles } from '../../../users/handlers/enrollment/constants.mjs';
import { ForbiddenOperationError } from '../../../commons/validations/security/restrictedAccess.mjs';

export const authorizeAdmin = async (event) => {

  const { profile } = event.requestContext.authorizer.claims;

  switch (profile) {
    case UserRoles.ADMIN:
      break;
    default:
      throw new ForbiddenOperationError();
  }
};