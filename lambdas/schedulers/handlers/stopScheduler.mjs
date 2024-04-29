import { DeleteScheduleCommand } from '@aws-sdk/client-scheduler';

import { schedulerClient } from '../../../client/aws/clients/schedulerClient.mjs';
import { HttpResponseCodes } from '../../../commons/web/webResponses.mjs';

import { sendResponse } from '../../../util/lambdaHelper.mjs';

exports.handle = async (event) => {

  const id = event.pathParameters.id;

  const input = { // PutRuleRequest
    Name: `edubit-timer-workshop-${id}`
  };

  try {

    const command = new DeleteScheduleCommand(input);
    const response = await schedulerClient.send(command);

    return sendResponse(HttpResponseCodes.OK, {message: response});
  } catch (error) {

    return sendResponse(HttpResponseCodes.INTERNAL_SERVER_ERROR, {message: error});
  }

};