import WorkshopRegistryRepository from '../../../../../persistence/repositories/workshopRegistryRepository.mjs';
import { HttpResponseCodes } from '../../../../../commons/web/webResponses.mjs';

import { sendResponse } from '../../../../../util/responseHelper.mjs';

exports.handle = async (event) => {
  try {

    const workshopExecutionId = event.pathParameters.workshopExecutionId;

    const events = await WorkshopRegistryRepository.findByWorkshopExecutionId(workshopExecutionId);

    return sendResponse(HttpResponseCodes.OK, events);
  } catch (error) {
    return sendResponse(HttpResponseCodes.INTERNAL_SERVER_ERROR, error);
  }
};