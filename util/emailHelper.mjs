import { AwsInfo } from '../client/aws/AwsInfo.mjs';

import { invokeLambda } from '../client/aws/clients/lambdaClient.mjs';
import { messageQueue } from '../client/aws/clients/sqsClient.mjs';

export const sendEmail = async (messages, wait = true) => {
  if (wait) {
    return await invokeEmailLambda(messages);
  }
  await messageEmailQueue(messages);
};

export const invokeEmailLambda = async (messages) => {

  const emailResult = await invokeLambda(AwsInfo.COMMONS_EMAIL_QUEUE, messages);

  console.log('emailResult', emailResult)

  if (emailResult.failed) {
    throw emailResult;
  }

  return emailResult;
};

export const messageEmailQueue = async (messages, messageAttributes = {}, delay = 0) => {
  return await messageQueue(AwsInfo.COMMONS_EMAIL_QUEUE, messages, messageAttributes, delay);
};