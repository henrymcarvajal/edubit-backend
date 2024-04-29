import { DatabaseErrorType } from '../../commons/database/handler/errorMapper.mjs';
import { HttpResponseCodes } from '../../../commons/web/webResponses.mjs';

import { sendErrorResponse, sendResponse } from '../../../util/lambdaHelper.mjs';

import { BusinessRuleValidationError } from '../../commons/validations/error.mjs';

export const handleMembersError = (error) => {
  if (error.type === DatabaseErrorType[DatabaseErrorType.INTEGRITY_CONSTRAINT_VIOLATION]) {
    return sendResponse(HttpResponseCodes.BAD_REQUEST, error);
  }

  if (error instanceof BusinessRuleValidationError) {
    return sendResponse(HttpResponseCodes.BAD_REQUEST, {message: error.message});
  }

  return sendErrorResponse(HttpResponseCodes.INTERNAL_SERVER_ERROR, error);
};