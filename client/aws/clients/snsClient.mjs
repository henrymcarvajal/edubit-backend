import { PublishCommand, SNSClient } from '@aws-sdk/client-sns';

import { AwsInfo } from '../AwsInfo.mjs';

export const snsClient = new SNSClient({region: AwsInfo.REGION});

export const publishMessageToTopic = async (topicArn, message, rawMessageAttributes) => {

  const messageAttributes = formatAttributes(rawMessageAttributes);

  const params = {
    Message: JSON.stringify(message),
    TopicArn: topicArn,
    MessageAttributes: messageAttributes
  };

  try {
    const command = new PublishCommand(params);
    return await snsClient.send(command);
  } catch (error) {
    console.log('SNS error', {error: error});
    return error;
  }
};

const formatAttributes = (rawMessageAttributes) => {
  const messageAttributes = {};
  Object.keys(rawMessageAttributes).forEach(key => {
    if (typeof rawMessageAttributes[key] === 'number') {
      messageAttributes[key] = {DataType: 'Number', StringValue: JSON.stringify(rawMessageAttributes[key])};
    } else if (typeof rawMessageAttributes[key] === 'string') {
      messageAttributes[key] = {DataType: 'String', StringValue: rawMessageAttributes[key]};
    } else {
      messageAttributes[key] = {DataType: 'String', StringValue: JSON.stringify(rawMessageAttributes[key])};
    }
  });
  return messageAttributes
}