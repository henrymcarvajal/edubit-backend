import { HttpResponseCodes } from '../../../../commons/web/webResponses.mjs';
import { SignUpMessages } from './validations/messages.mjs';

import { handleErrorResponse } from '../../../commons/errorHandling.mjs';
import { sendResponse } from '../../../../util/responseHelper.mjs';

export const handleEnrollmentError = (error) => {
  console.log('SignUp Cognito error', error);

  if (error.code) {
    switch (error.code) {
      case 'UsernameExistsException':
        return sendResponse(HttpResponseCodes.BAD_REQUEST, { message: SignUpMessages.USER_ALREADY_EXISTS });
    }
  }

  return handleErrorResponse(error);
};