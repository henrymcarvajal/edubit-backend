import { HttpResponseCodes } from '../../../../../commons/web/webResponses.mjs';
import { WorkshopExecutionRepository } from '../../../../../persistence/repositories/workshopExecutionRepository.mjs';

import { arrayEmpty } from '../../../../../util/arrays.mjs';
import { authorizeAdmin } from '../../../../members/authorizers/adminAuthorizer.mjs';
import { calculateTiming } from '../../../../workshops/handlers/execution/calculateWorkshopTiming.mjs';
import { handleErrorResponse } from '../../../../commons/errorHandling.mjs';
import { sendResponse } from '../../../../../util/responseHelper.mjs';

import { ResourceNotFoundError } from '../../../../commons/errors/integrity/resources.mjs';

export const handle = async (event) => {
  try {
    authorizeAdmin(event);

    const workshopExecutions = await fetchWorkshops();
    const todayWorkshopExecutions = fillWorkshopExecutions(workshopExecutions);

    return sendResponse(HttpResponseCodes.OK, todayWorkshopExecutions);
  } catch (error) {
    return handleErrorResponse(error);
  }
};

const fetchWorkshops = async () => {
  const workshopExecutions = await WorkshopExecutionRepository.findForToday();
  if (arrayEmpty(workshopExecutions)) {
    throw new ResourceNotFoundError('No workshops for today');
  }
  return workshopExecutions;
};

const fillWorkshopExecutions = (workshopExecutions) => {
  const todayWorkshopExecutions = {};
  workshopExecutions.forEach(workshopExecution => {
    if (workshopExecution.startTimestamp) {
      workshopExecution.timing = calculateTiming(workshopExecution);
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
  });

  return todayWorkshopExecutions;
};