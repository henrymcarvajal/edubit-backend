import { CreateScheduleCommand } from '@aws-sdk/client-scheduler';

import { AwsInfo } from '../../../client/aws/AwsInfo.mjs';
import { HttpResponseCodes } from '../../../commons/web/webResponses.mjs';
import { UserRoles } from '../../users/handlers/enrollment/constants.mjs';
import { schedulerClient } from '../../../client/aws/clients/schedulerClient.mjs';
import { SchedulerMessages } from './messages.mjs';
import { ValueValidationMessages } from '../../../commons/messages.mjs';
import { WorkshopExecutionRepository } from '../../../persistence/repositories/workshopExecutionRepository.mjs';

import { execOnDatabase } from '../../../util/dbHelper.mjs';
import { getDeployedSchedulesNames, getScheduleName } from './getSchedulerList.mjs';
import { sendResponse } from '../../../util/responseHelper.mjs';
import { validate as uuidValidate } from 'uuid';

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

    if (!workshopExecution.remainingTime) return sendResponse(HttpResponseCodes.CONFLICT, {message: `${SchedulerMessages.NO_REMAINING_TIME_FOR_WORKSHOP}: ${id}`});

    const schedulesNames = await getDeployedSchedulesNames();

    if (!schedulesNames.includes(getScheduleName(id))) {
      const createInput = createCreateScheduleCommandInput(id);
      const createScheduleCommand = new CreateScheduleCommand(createInput);
      const createResponse = await schedulerClient.send(createScheduleCommand);

      const response = {};
      response.scheduleArn = createResponse.ScheduleArn;
      response.remainingTime = workshopExecution.remainingTime;
      response.elapsedTime = workshopExecution.elapsedTime;

      workshopExecution.startTimestamp = new Date();
      const {entity, statement} = WorkshopExecutionRepository.upsertStatement(workshopExecution);

      await execOnDatabase({statement: statement, parameters: entity});

      return sendResponse(HttpResponseCodes.CREATED, response);

    } else {
      return sendResponse(HttpResponseCodes.NO_CONTENT);
    }

  } catch (error) {
    return sendResponse(HttpResponseCodes.INTERNAL_SERVER_ERROR, error, true);
  }
};