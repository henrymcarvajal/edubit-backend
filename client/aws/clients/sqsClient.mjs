import { SQSClient, SendMessageCommand } from '@aws-sdk/client-sqs';

import { AwsInfo } from '../AwsInfo.mjs';

export const sqsClient = new SQSClient({region: AwsInfo.REGION});

export const messageQueue = async (queue, message, messageAttributes = {}, delay = 0) => {

  const params = {
    DelaySeconds: delay,
    MessageAttributes: messageAttributes,
    MessageBody: JSON.stringify(message),
    QueueUrl: queue,
  };

  const command = new SendMessageCommand(params);

  return sqsClient.send(command);
};