import { DatabaseErrorType } from './database/handler/errorMapper.mjs';
import { HttpResponseCodes } from './../../commons/web/webResponses.mjs';

import { sendResponse } from '../../util/responseHelper.mjs';

import { InvalidInputError } from './errors/data/input.mjs';
import {
  ResourceNotFoundError,
  ResourceStateError,
  ResourceUnmodifiedError
} from './errors/integrity/resources.mjs';
import { ForbiddenOperationError, UnauthorizedOperationError } from './errors/security/restrictedAccess.mjs';

export const handleErrorResponse = (error) => {
  if (error.type === DatabaseErrorType[DatabaseErrorType.INTEGRITY_CONSTRAINT_VIOLATION]) {
    return sendResponse(HttpResponseCodes.BAD_REQUEST, error);
  }

  if (error instanceof InvalidInputError) {
    return sendResponse(HttpResponseCodes.BAD_REQUEST, { message: error.message });
  }

  if (error instanceof UnauthorizedOperationError) {
    return sendResponse(HttpResponseCodes.UNAUTHORIZED, { message: error.message });
  }

  if (error instanceof ForbiddenOperationError) {
    return sendResponse(HttpResponseCodes.FORBIDDEN, { message: error.message });
  }

  if (error instanceof ResourceNotFoundError) {
    return sendResponse(HttpResponseCodes.NOT_FOUND, { message: error.message });
  }

  if (error instanceof ResourceStateError) {
    return sendResponse(HttpResponseCodes.CONFLICT, { message: error.message });
  }

  if (error instanceof ResourceUnmodifiedError) {
    return sendResponse(HttpResponseCodes.NO_CONTENT, { message: error.message });
  }

  return sendResponse(HttpResponseCodes.INTERNAL_SERVER_ERROR, error);
};