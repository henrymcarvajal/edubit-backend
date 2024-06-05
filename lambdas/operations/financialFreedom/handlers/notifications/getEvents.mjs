import { HttpResponseCodes } from '../../../../../commons/web/webResponses.mjs';
import { WorkshopRegistryRepository } from '../../../../../persistence/repositories/workshopRegistryRepository.mjs';

import { sendResponse } from '../../../../../util/responseHelper.mjs';

export const handle = async (event) => {

  try {

    const workshopExecutionId = event.pathParameters.workshopExecutionId;

    const events = await WorkshopRegistryRepository.findByWorkshopExecutionId(workshopExecutionId);

    return sendResponse(HttpResponseCodes.OK, events);
  } catch (error) {
    return sendResponse(HttpResponseCodes.INTERNAL_SERVER_ERROR, error);
  }
};