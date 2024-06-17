import { SendEmailCommand, SESClient } from '@aws-sdk/client-ses';

import { AwsInfo } from '../AwsInfo.mjs';

const sesClient = new SESClient({ region: AwsInfo.REGION });

const sendEmail = async (addresses, body, subject) => {
  const params = {
    Destination: {
      ToAddresses: addresses
    },
    Message: {
      Body: {
        Text: { Data: body },
      },

      Subject: { Data: subject },
    },
    Source: 'info@edubit360.com',
  };

  try {
    const command = new SendEmailCommand(params);
    return await sesClient.send(command);
  } catch (error) {
    console.log('error', error);
  }
};

export default sendEmail;