import { DatabaseErrorType } from '../../commons/database/handler/errorMapper.mjs';
import { HttpResponseCodes } from '../../../commons/web/webResponses.mjs';

import { sendErrorResponse, sendResponse } from '../../../util/lambdaHelper.mjs';

import { MissingPropertyError } from '../../../util/error.mjs';

export const handleWorkshopError = (error) => {
  if (error.type === DatabaseErrorType[DatabaseErrorType.INTEGRITY_CONSTRAINT_VIOLATION]) {
    return sendResponse(HttpResponseCodes.BAD_REQUEST, error);
  }

  if (error instanceof MissingPropertyError) {
    return sendResponse(HttpResponseCodes.BAD_REQUEST, {message: error.message});
  }

  return sendErrorResponse(HttpResponseCodes.INTERNAL_SERVER_ERROR, error);
};