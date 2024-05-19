import { ListSchedulesCommand } from '@aws-sdk/client-scheduler';

import { HttpResponseCodes } from '../../../commons/web/webResponses.mjs';
import { schedulerClient } from '../../../client/aws/clients/schedulerClient.mjs';
import { UserRoles } from '../../users/handlers/enrollment/constants.mjs';
import { WorkshopExecutionRepository } from '../../../persistence/repositories/workshopExecutionRepository.mjs';

import { createListSchedulesCommandInput, getScheduleId, getScheduleName } from './getSchedulerList.mjs';
import { sendResponse } from '../../../util/lambdaHelper.mjs';

exports.handle = async (event) => {

  if (!event.requestContext.authorizer) return sendResponse(HttpResponseCodes.UNAUTHORIZED);

  const roles = event.requestContext.authorizer.claims.profile;
  if (roles !== UserRoles.ADMIN) return sendResponse(HttpResponseCodes.FORBIDDEN);

  try {

    const listInput = createListSchedulesCommandInput();
    const listCommand = new ListSchedulesCommand(listInput);
    const listResponse = await schedulerClient.send(listCommand);

    console.log('listResponse.Schedules', listResponse.Schedules);

    const ids = listResponse.Schedules.length ? listResponse.Schedules.map(s => getScheduleId(s.Name)) : null;

    if (!ids) return sendResponse(HttpResponseCodes.NOT_FOUND);

    const workshopExecutions = await WorkshopExecutionRepository.findByIdIn(ids);

    const response = ids.map(id => {
      const w = workshopExecutions.find(workshopExecution => workshopExecution.id === id);
      const s = listResponse.Schedules.find(schedule => schedule.Name === getScheduleName(id));

      return {
        id: id,
        name: s.Name,
        state: s.State,
        elapsedTime: w.elapsedTime,
        remainingTime: w.remainingTime,
        creationDate: s.CreationDate,
        lastModificationDate: s.LastModificationDate
      };
    });

    return sendResponse(HttpResponseCodes.OK, response);

  } catch (error) {
    return sendResponse(HttpResponseCodes.INTERNAL_SERVER_ERROR, { message: error });
  }
};