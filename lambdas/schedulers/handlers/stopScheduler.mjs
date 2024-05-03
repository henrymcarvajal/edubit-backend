import { DeleteScheduleCommand } from '@aws-sdk/client-scheduler';

import { HttpResponseCodes } from '../../../commons/web/webResponses.mjs';
import { schedulerClient } from '../../../client/aws/clients/schedulerClient.mjs';
import { SchedulerMessages } from './message.mjs';
import { UserRoles } from '../../users/handlers/enrollment/constants.mjs';
import { ValueValidationMessages } from '../../../commons/messages.mjs';
import { WorkshopExecutionRepository } from '../../../persistence/repositories/workshopExecutionRepository.mjs';

import { isUUID } from '../../../commons/validations.mjs';
import { sendResponse } from '../../../util/lambdaHelper.mjs';
import { getDeployedSchedulesNames, getScheduleName } from './getSchedulerList.mjs';

const createDeleteScheduleCommandInput = (id) => {
  return {
    Name: getScheduleName(id)
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

    if (schedulesNames.includes(getScheduleName(id))) {
      const deleteInput = createDeleteScheduleCommandInput(id);
      const deleteScheduleCommand = new DeleteScheduleCommand(deleteInput);
      await schedulerClient.send(deleteScheduleCommand);

      return sendResponse(HttpResponseCodes.OK);

    } else {
      return sendResponse(HttpResponseCodes.NOT_FOUND, {message: `${SchedulerMessages.WORKSHOP_EXECUTION_NOT_FOUND}: ${id}`});
    }

  } catch (error) {
    return sendResponse(HttpResponseCodes.INTERNAL_SERVER_ERROR, {message: error});
  }
};