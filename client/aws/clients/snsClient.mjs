import { PublishCommand, SNSClient } from '@aws-sdk/client-sns';

import { AwsInfo } from '../AwsInfo.mjs';

export const snsClient = new SNSClient({region: AwsInfo.REGION});

export const publishMessageToTopic = async (topicArn, message) => {

  const params = {
    Message: message,
    TopicArn: topicArn
  };

  try {
    const command = new PublishCommand(params);
    return await snsClient.send(command);
  } catch (error) {
    console.log('SNS error', {error: error});
    return error;
  }
};