import { AwsInfo } from '../enrollment/awsInfo.mjs';
import { cognitoClient } from '../../../../client/aws/clients/cognitoClient.mjs';
import { HttpResponseCodes } from '../../../../commons/web/webResponses.mjs';
import { ChangePasswordMessages } from '../enrollment/validations/messages.mjs';

import { sendErrorResponse, sendResponse } from '../../../../util/lambdaHelper.mjs';
import { validatePassword } from '../enrollment/policies/credentialsPolicy.mjs';

import { CredentialsValidationError } from '../enrollment/validations/error.mjs';
import { ConfirmForgotPasswordCommand, ExpiredCodeException } from '@aws-sdk/client-cognito-identity-provider';

export const handler = async (event) => {

  try {

    const {email, newPassword, token} = JSON.parse(event.body);

    await validatePassword(newPassword);

    const input = { // ConfirmForgotPasswordRequest
      ClientId: AwsInfo.COGNITO_USER_POOL_CLIENT_ID,
      Username: email.toLowerCase(),
      ConfirmationCode: token,
      Password: newPassword
    };

    const confirmForgotPasswordCommand = new ConfirmForgotPasswordCommand(input);
    await cognitoClient.send(confirmForgotPasswordCommand);

    return sendResponse(HttpResponseCodes.OK, {message: ChangePasswordMessages.PASSWORD_CHANGED_SUCCESSFULLY});

  } catch (error) {

    if (error instanceof CredentialsValidationError) {
      return sendResponse(HttpResponseCodes.BAD_REQUEST, {message: error.message});
    } else if (error instanceof ExpiredCodeException) {
      return sendResponse(HttpResponseCodes.BAD_REQUEST, {message: ChangePasswordMessages.TOKEN_EXPIRED});
    }

    const message = error.message ? error.message : 'Internal server error';
    return sendErrorResponse(HttpResponseCodes.INTERNAL_SERVER_ERROR, {message: message});
  }
};