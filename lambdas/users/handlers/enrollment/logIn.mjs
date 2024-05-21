import { AwsInfo } from './awsInfo.mjs';
import { CognitoIdentityServiceProvider } from 'aws-sdk';
import { HttpResponseCodes } from '../../../../commons/web/webResponses.mjs';
import { LoginMessages } from './validations/messages.mjs';
import { UserRepository } from '../../../../persistence/repositories/userRepository.mjs';

import { sendResponse } from '../../../../util/lambdaHelper.mjs';

import { CredentialsValidationError } from './validations/error.mjs';

const cognito = new CognitoIdentityServiceProvider();

export const handler = async (event) => {
  try {

    let {email, password} = JSON.parse(event.body);

    if (!email || !password) {
      return sendResponse(HttpResponseCodes.BAD_REQUEST, {message: LoginMessages.EMPTY_CREDENTIALS});
    }

    email = email.toLowerCase();
    const userPoolId = AwsInfo.COGNITO_USER_POOL_ID;
    const clientId = AwsInfo.COGNITO_USER_POOL_CLIENT_ID;
    const params = {
      AuthFlow: 'ADMIN_NO_SRP_AUTH',
      UserPoolId: userPoolId,
      ClientId: clientId,
      AuthParameters: {
        USERNAME: email,
        PASSWORD: password
      }
    };

    const cognitoResponse = await cognito.adminInitiateAuth(params).promise();

    const [user] = await UserRepository.findViewByEmail(email);
    if (!user) {
      return sendResponse(HttpResponseCodes.BAD_REQUEST, {message: LoginMessages.BAD_CREDENTIALS});
    }

    const response = {};
    response.memberId = user.memberId;
    response.token = cognitoResponse.AuthenticationResult.IdToken;


    return sendResponse(HttpResponseCodes.OK, response);
  } catch (error) {
    if (error instanceof CredentialsValidationError) {
      return sendResponse(HttpResponseCodes.BAD_REQUEST, {message: error.message});
    } else if (error.code) {
      switch (error.code) {
        case 'NotAuthorizedException':
        case 'UserNotFoundException':
          return sendResponse(HttpResponseCodes.BAD_REQUEST, {message: LoginMessages.BAD_CREDENTIALS});
        case 'UserNotConfirmedException':
          return sendResponse(HttpResponseCodes.BAD_REQUEST, {message: LoginMessages.USER_NOT_CONFIRMED});
      }
    }

    console.log('LogIn Cognito error', error);

    const message = error.message ? error.message : 'Internal server error';
    return sendResponse(HttpResponseCodes.INTERNAL_SERVER_ERROR, {message: message});
  }
};