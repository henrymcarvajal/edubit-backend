import { FailedValidationError } from '../../../commons/validations/error.mjs';
import { sendResponse } from '../../../../util/responseHelper.mjs';
import { HttpResponseCodes } from '../../../../commons/web/webResponses.mjs';
import { SignUpMessages } from './validations/messages.mjs';
import { GenericMessages } from '../../../../util/messages.mjs';

export const handleEnrollmentError = (error) => {
  if (error instanceof FailedValidationError) {
    return sendResponse(HttpResponseCodes.BAD_REQUEST, {message: error.message});
  } else if (error.code) {
    switch (error.code) {
      case 'UsernameExistsException':
        return sendResponse(HttpResponseCodes.BAD_REQUEST, {message: SignUpMessages.USER_ALREADY_EXISTS});
    }
  }

  console.log('SignUp Cognito error', error);
  const message = error.message ? error.message : GenericMessages.INTERNAL_SERVER_ERROR;
  return sendResponse(HttpResponseCodes.INTERNAL_SERVER_ERROR, {message: message});
};