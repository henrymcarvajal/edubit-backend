import { LambdaClient, InvokeCommand } from '@aws-sdk/client-lambda';

import { AwsInfo } from '../AwsInfo.mjs';

export const lambdaClient = new LambdaClient({region: AwsInfo.REGION});

export const invokeLambda = async (lambdaName, payload, isAsync = false) => {

  const params = { // InvocationRequest
    FunctionName: lambdaName, // required
    InvocationType: isAsync ? 'Event' : 'RequestResponse',
    LogType: 'Tail',
    //ClientContext: "STRING_VALUE",
    Payload: JSON.stringify(payload),
    //Qualifier: "STRING_VALUE",
  };

  const command = new InvokeCommand(params);

  return lambdaClient.send(command);
};

