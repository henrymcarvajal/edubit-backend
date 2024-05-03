import { CreateScheduleCommand } from '@aws-sdk/client-scheduler';

import { AwsInfo } from '../../../client/aws/AwsInfo.mjs';
import { HttpResponseCodes } from '../../../commons/web/webResponses.mjs';
import { UserRoles } from '../../users/handlers/enrollment/constants.mjs';
import { schedulerClient } from '../../../client/aws/clients/schedulerClient.mjs';
import { SchedulerMessages } from './message.mjs';
import { ValueValidationMessages } from '../../../commons/messages.mjs';
import { WorkshopExecutionRepository } from '../../../persistence/repositories/workshopExecutionRepository.mjs';

import { getDeployedSchedulesNames, getScheduleName } from './getSchedulerList.mjs';
import { isUUID } from '../../../commons/validations.mjs';
import { sendErrorResponse, sendResponse } from '../../../util/lambdaHelper.mjs';

const createCreateScheduleCommandInput = (id) => {
  return {
    Name: getScheduleName(id),
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
};

exports.handle = async (event) => {

  if (!event.requestContext.authorizer) return sendResponse(HttpResponseCodes.UNAUTHORIZED);

  const roles = event.requestContext.authorizer.claims.profile;
  if (roles !== UserRoles.ADMIN) return sendResponse(HttpResponseCodes.FORBIDDEN);

  const id = event.pathParameters.id;
  if (!isUUID(id)) return sendResponse(HttpResponseCodes.BAD_REQUEST, {message: `${ValueValidationMessages.VALUE_IS_NOT_UUID}: ${id}`});

  try {

    const [workshopExecution] = await WorkshopExecutionRepository.findById(id);
    if (!workshopExecution) return sendResponse(HttpResponseCodes.NOT_FOUND, {message: `${SchedulerMessages.WORKSHOP_EXECUTION_NOT_FOUND}: ${id}`});

    const schedulesNames = await getDeployedSchedulesNames();

    if (!schedulesNames.includes(getScheduleName(id))) {
      const createInput = createCreateScheduleCommandInput(id);
      const createScheduleCommand = new CreateScheduleCommand(createInput);
      const createResponse = await schedulerClient.send(createScheduleCommand);

      const response = {};
      response.scheduleArn = createResponse.ScheduleArn;
      response.remainingTime = workshopExecution.remainingTime;

      return sendResponse(HttpResponseCodes.CREATED, response);

    } else {
      return sendResponse(HttpResponseCodes.NO_CONTENT);
    }

  } catch (error) {
    return sendErrorResponse(HttpResponseCodes.INTERNAL_SERVER_ERROR, error);
  }
};