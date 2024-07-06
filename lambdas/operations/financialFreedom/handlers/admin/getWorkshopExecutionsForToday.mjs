import { HttpResponseCodes } from '../../../../../commons/web/webResponses.mjs';
import { WorkshopExecutionRepository } from '../../../../../persistence/repositories/workshopExecutionRepository.mjs';

import { authorizeAdmin } from './adminAuthorizer.mjs';
import { calculateTiming } from '../../../../workshops/handlers/execution/calculateWorkshopTiming.mjs';
import { handleError } from '../errorHandling.mjs';
import { sendResponse } from '../../../../../util/responseHelper.mjs';

export const handle = async (event) => {

  try {

    const { response } = await authorizeAdmin(event);
    if (response) return response;

    const workshopExecutions = await WorkshopExecutionRepository.findForToday();
    if (!workshopExecutions || workshopExecutions.length === 0) {
      return sendResponse(HttpResponseCodes.NOT_FOUND);
    }


    const todayWorkshopExecutions = {}
    workshopExecutions.forEach(workshopExecution => {
      if (workshopExecution.startTimestamp) {
        workshopExecution.timing = calculateTiming(workshopExecution)
        if (!todayWorkshopExecutions.current) {
          todayWorkshopExecutions.current = [];
        }
        todayWorkshopExecutions.current.push(workshopExecution);
      } else {
        if (!todayWorkshopExecutions.incoming) {
          todayWorkshopExecutions.incoming = [];
        }
        todayWorkshopExecutions.incoming.push(workshopExecution);
      }
    })

    return sendResponse(HttpResponseCodes.OK, todayWorkshopExecutions);

  } catch (error) {
    return handleError(error);
  }
};
