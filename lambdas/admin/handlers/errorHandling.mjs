import { DatabaseErrorType } from '../../commons/database/handler/errorMapper.mjs';
import { HttpResponseCodes } from '../../../commons/web/webResponses.mjs';

import { sendResponse } from '../../../util/responseHelper.mjs';

import { FailedValidationError } from '../../commons/validations/error.mjs';

export const handleAdminError = (error) => {
  if (error.type === DatabaseErrorType[DatabaseErrorType.INTEGRITY_CONSTRAINT_VIOLATION]) {
    return sendResponse(HttpResponseCodes.BAD_REQUEST, error);
  }

  if (error instanceof FailedValidationError) {
    return sendResponse(HttpResponseCodes.BAD_REQUEST, {message: error.message});
  }

  return sendResponse(HttpResponseCodes.INTERNAL_SERVER_ERROR, error, true);
};