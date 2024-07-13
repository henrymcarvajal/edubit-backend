import { AwsInfo } from '../enrollment/awsInfo.mjs';
import { cognitoClient } from '../../../../client/aws/clients/cognitoClient.mjs';
import { HttpResponseCodes } from '../../../../commons/web/webResponses.mjs';

import { handleError } from './errorHandling.mjs';
import { sendResponse } from '../../../../util/responseHelper.mjs';

import { ForgotPasswordCommand } from '@aws-sdk/client-cognito-identity-provider';
import { validateEmail } from '../../../../util/generalValidations.mjs';
import { ChangePasswordMessages } from '../../commons/messages.mjs';

export const handler = async (event) => {
  try {
    const email = await validateAndExtractParams(event);
    await issueChangePasswordCommand(email);
  } catch (error) {
    handleError(error);
  }

  return sendResponse(HttpResponseCodes.OK, { message: ChangePasswordMessages.TOKEN_SENT });
};

const validateAndExtractParams = async (event) => {
  const { email } = JSON.parse(event.body);
  await validateEmail(email);
  return email;
};

const issueChangePasswordCommand = async (email) => {
  const input = {
    ClientId: AwsInfo.COGNITO_USER_POOL_CLIENT_ID,
    Username: email.toLowerCase()
  };

  const forgotPasswordCommand = new ForgotPasswordCommand(input);
  await cognitoClient.send(forgotPasswordCommand);
};