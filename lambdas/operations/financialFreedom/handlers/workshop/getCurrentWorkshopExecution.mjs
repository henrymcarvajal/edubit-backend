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

    const [workshopExecution] = await WorkshopExecutionRepository.findCurrent();
    if (!workshopExecution) {
      return sendResponse(HttpResponseCodes.NOT_FOUND);
    }

    const timing = calculateTiming(workshopExecution)

    return sendResponse(HttpResponseCodes.OK, {...workshopExecution, timing: timing});

  } catch (error) {
    return handleError(error);
  }
};
