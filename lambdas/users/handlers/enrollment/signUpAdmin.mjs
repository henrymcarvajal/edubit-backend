import { GenericMessages } from '../../../../util/messages.mjs';
import { HttpResponseCodes } from '../../../../commons/web/webResponses.mjs';
import { SignUpMessages } from './validations/messages.mjs';
import { UserRepository } from '../../../../persistence/repositories/userRepository.mjs';
import { UserRoles } from './constants.mjs';

import { checkProps } from '../../../../util/propsGetter.mjs';
import { execOnDatabase } from '../../../../util/dbHelper.mjs';
import { registerUserInCognito } from './cognito.mjs';
import { sendResponse } from '../../../../util/responseHelper.mjs';
import { validateCredentials } from './policies/credentialsPolicy.mjs';

import { CredentialsValidationError } from './validations/error.mjs';

export const handler = async (event) => {

  try {
    const user = JSON.parse(event.body);

    const userProps = ['email', 'password'];
    checkProps(user, userProps);

    await validateCredentials(user.email, user.password);

    user.email = user.email.toLowerCase();
    await registerUserInCognito(user.email, user.password, UserRoles.ADMIN);

    user.roles = UserRoles.ADMIN;

    const {statement, entity} = UserRepository.insertStatement(user);

    await execOnDatabase([{statement: statement, parameters: entity}]);

    return sendResponse(HttpResponseCodes.OK, {message: SignUpMessages.USER_REGISTRATION_SUCCESSFUL});

  } catch (error) {
    if (error instanceof CredentialsValidationError) {
      return sendResponse(HttpResponseCodes.BAD_REQUEST, {message: error.message});
    } else if (error.code) {
      switch (error.code) {
        case 'UsernameExistsException':
          return sendResponse(HttpResponseCodes.BAD_REQUEST, {message: SignUpMessages.USER_ALREADY_EXISTS});
      }
    }

    const message = error.message ? error.message : GenericMessages.INTERNAL_SERVER_ERROR;
    return sendResponse(HttpResponseCodes.INTERNAL_SERVER_ERROR, {message: message});
  }
};