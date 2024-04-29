import { HttpResponseCodes } from '../../../../commons/web/webResponses.mjs';
import { WorkshopDefinitionRepository } from '../../../../persistence/repositories/workshopDefinitionRepository.mjs';

import { sendErrorResponse, sendResponse } from '../../../../util/lambdaHelper.mjs';

export const handle = async (event) => {

  const id = event.pathParameters.id;

  try {

    const [workshop] = await WorkshopDefinitionRepository.findById(id);

    if (!workshop) {
      return sendResponse(HttpResponseCodes.NOT_FOUND);
    }

    return sendResponse(HttpResponseCodes.OK, workshop);

  } catch (error) {
    return sendErrorResponse(HttpResponseCodes.INTERNAL_SERVER_ERROR, error);
  }
};