import { AssetRepository } from '../../../../persistence/repositories/assetRepository.mjs';
import { HttpResponseCodes } from '../../../../commons/web/webResponses.mjs';

import { handleAdminError } from '../errorHandling.mjs';
import { sendResponse } from '../../../../util/lambdaHelper.mjs';

export const handle = async (event) => {

  const id = event.pathParameters.id;

  try {
    const [asset] = await AssetRepository.findById(id);
    if (!asset) return sendResponse(HttpResponseCodes.NOT_FOUND);

    return sendResponse(HttpResponseCodes.OK, asset);

  } catch (error) {
    return handleAdminError(error);
  }
};