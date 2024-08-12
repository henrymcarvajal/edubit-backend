import { AwsInfo } from '../client/aws/AwsInfo.mjs';

import { invokeLambda } from '../client/aws/clients/lambdaClient.mjs';
import { messageQueue } from '../client/aws/clients/sqsClient.mjs';

export const execOnDatabase = async (statementsWithParameters, wait = true) => {
  if (wait) {
    return await invokeDatabaseLambda(statementsWithParameters);
  }
  await messageDatabaseQueue(statementsWithParameters);
};

export const invokeDatabaseLambda = async (statementsWithParams) => {

  const databaseResult = await invokeLambda(AwsInfo.COMMONS_DATABASE_LAMBDA, statementsWithParams);

  if (databaseResult.failed) {
    throw databaseResult;
  }

  return databaseResult;
};

export const messageDatabaseQueue = async (statementsWithParams, delay = 0) => {
  return await messageQueue(AwsInfo.COMMONS_DATABASE_QUEUE, statementsWithParams, null, delay);
};