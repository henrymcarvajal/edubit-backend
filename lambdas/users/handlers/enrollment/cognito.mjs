import { AwsInfo } from './awsInfo.mjs';
import { CognitoIdentityServiceProvider } from 'aws-sdk';

const cognito = new CognitoIdentityServiceProvider();
export const registerUserInCognito = async (email, password, roles) => {
  const user_pool_id = AwsInfo.COGNITO_USER_POOL_ID;
  const user_pool_client_id = AwsInfo.COGNITO_USER_POOL_CLIENT_ID;

  const params = {
    ClientId: user_pool_client_id,
    Password: password,
    Username: email,
    UserAttributes: [
      {
        Name: 'email',
        Value: email
      },
      {
        Name: 'profile',
        Value: roles
      }
    ]
  };

  const response = await cognito.signUp(params).promise();

  if (response.User) {
    const paramsForSetPass = {
      Password: password,
      UserPoolId: user_pool_id,
      Username: email,
      Permanent: true
    };
    await cognito.adminSetUserPassword(paramsForSetPass).promise();
  }
};