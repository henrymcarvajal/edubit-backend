import { AwsInfo } from '../enrollment/awsInfo.mjs';
import { cognitoClient } from '../../../../client/aws/clients/cognitoClient.mjs';
import { HttpResponseCodes } from '../../../../commons/web/webResponses.mjs';

import { sendResponse } from '../../../../util/lambdaHelper.mjs';

import { ForgotPasswordCommand } from '@aws-sdk/client-cognito-identity-provider';

export const handler = async (event) => {

  const {email} = JSON.parse(event.body);

  const input = {
    ClientId: AwsInfo.COGNITO_USER_POOL_CLIENT_ID,
    Username: email.toLowerCase()
  };

  const forgotPasswordCommand = new ForgotPasswordCommand(input);
  await cognitoClient.send(forgotPasswordCommand);

  return sendResponse(HttpResponseCodes.OK, {message: 'Change password token sent successfully'});
};