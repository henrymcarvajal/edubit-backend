import { UpdateScheduleCommand } from '@aws-sdk/client-scheduler';

import { AwsInfo } from '../../../client/aws/AwsInfo.mjs';
import { HttpResponseCodes } from '../../../commons/web/webResponses.mjs';
import { schedulerClient } from '../../../client/aws/clients/schedulerClient.mjs';
import { SchedulerMessages } from './messages.mjs';
import { UserRoles } from '../../users/handlers/enrollment/constants.mjs';
import { ValueValidationMessages } from '../../../commons/messages.mjs';
import { WorkshopExecutionRepository } from '../../../persistence/repositories/workshopExecutionRepository.mjs';

import { getDeployedSchedulesNames, getScheduleName } from './getSchedulerList.mjs';
import { sendResponse } from '../../../util/responseHelper.mjs';
import { validate as uuidValidate } from 'uuid';

const createUpdateScheduleCommandInput = (id) => {
  return {
    Name: getScheduleName(id),
    ScheduleExpression: 'rate(1 minute)',
    State: 'DISABLED',
    Target: {
      Arn: AwsInfo.SCHEDULERS_TARGET_QUEUE_ARN,
      RoleArn: AwsInfo.SCHEDULERS_EXECUTION_ROLE_ARN,
      Input: `{"id": "${id}"}`,
    },
    FlexibleTimeWindow: {
      Mode: 'OFF',
    },
  };
};

exports.handle = async (event) => {

  if (!event.requestContext.authorizer) return sendResponse(HttpResponseCodes.UNAUTHORIZED);

  const roles = event.requestContext.authorizer.claims.profile;
  if (roles !== UserRoles.ADMIN) return sendResponse(HttpResponseCodes.FORBIDDEN);

  const id = event.pathParameters.id;
  if (!uuidValidate(id)) return sendResponse(HttpResponseCodes.BAD_REQUEST, {message: `${ValueValidationMessages.VALUE_IS_NOT_UUID}: ${id}`});

  try {

    const [workshopExecution] = await WorkshopExecutionRepository.findById(id);
    if (!workshopExecution) return sendResponse(HttpResponseCodes.NOT_FOUND, {message: `${SchedulerMessages.WORKSHOP_EXECUTION_NOT_FOUND}: ${id}`});

    const schedulesNames = await getDeployedSchedulesNames();

    if (schedulesNames.includes(getScheduleName(id))) {
      const updateInput = createUpdateScheduleCommandInput(id);
      const updateScheduleCommand = new UpdateScheduleCommand(updateInput);
      const updateResponse = await schedulerClient.send(updateScheduleCommand);

      const response = {};
      response.scheduleArn = updateResponse.ScheduleArn;
      response.remainingTime = workshopExecution.remainingTime;

      return sendResponse(HttpResponseCodes.OK, response);

    } else {
      return sendResponse(HttpResponseCodes.NOT_FOUND, {message: `${SchedulerMessages.SCHEDULER_NOT_FOUND}: ${id}`});
    }

  } catch (error) {
    return sendResponse(HttpResponseCodes.INTERNAL_SERVER_ERROR, {message: error});
  }
};