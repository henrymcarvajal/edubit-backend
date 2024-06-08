import { DatabaseErrorType } from '../../../commons/database/handler/errorMapper.mjs';
import { HttpResponseCodes } from '../../../../commons/web/webResponses.mjs';

import { sendResponse } from '../../../../util/responseHelper.mjs';

import { FailedValidationError, ReferenceNotFoundError } from '../../../commons/validations/error.mjs';
import { UnauthorizedOperationError } from '../validations/error.mjs';

export const handleError = (error) => {
  if (error.type === DatabaseErrorType[DatabaseErrorType.INTEGRITY_CONSTRAINT_VIOLATION]) {
    return sendResponse(HttpResponseCodes.BAD_REQUEST, error);
  }

  if (error instanceof ReferenceNotFoundError) {
    return sendResponse(HttpResponseCodes.NOT_FOUND, {message: error.message});
  }

  if (error instanceof FailedValidationError) {
    return sendResponse(HttpResponseCodes.BAD_REQUEST, {message: error.message});
  }

  if (error instanceof UnauthorizedOperationError) {
    return sendResponse(HttpResponseCodes.UNAUTHORIZED, {message: error.message});
  }

  return sendResponse(HttpResponseCodes.INTERNAL_SERVER_ERROR, error);
};