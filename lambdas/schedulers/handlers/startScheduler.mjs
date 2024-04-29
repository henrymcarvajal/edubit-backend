import { CreateScheduleCommand } from '@aws-sdk/client-scheduler';

import { schedulerClient } from '../../../client/aws/clients/schedulerClient.mjs';
import { HttpResponseCodes } from '../../../commons/web/webResponses.mjs';
import { AwsInfo } from '../../../client/aws/AwsInfo.mjs';

import { sendResponse } from '../../../util/lambdaHelper.mjs';

exports.handle = async (event) => {

  const id = event.pathParameters.id;

  const input = {
    Name: `edubit-timer-workshop-${id}`,
    ScheduleExpression: 'rate(1 minute)',
    ScheduleExpressionTimezone: 'America/Bogota',
    Description: `Edubit timer for workshop ${id}`,
    State: 'ENABLED',
    Target: {
      Arn: AwsInfo.SCHEDULERS_TARGET_QUEUE_ARN,
      RoleArn: AwsInfo.SCHEDULERS_EXECUTION_ROLE_ARN,
      Input: `{id: ${id}, currentTimestamp: ${new Date().getTime()}}`,
    },
    FlexibleTimeWindow: {
      Mode: 'OFF',
    },
  };

  try {

    const command = new CreateScheduleCommand(input);
    const response = await schedulerClient.send(command);

    return sendResponse(HttpResponseCodes.OK, {message: response});
  } catch (error) {

    return sendResponse(HttpResponseCodes.INTERNAL_SERVER_ERROR, {message: error});
  }
};