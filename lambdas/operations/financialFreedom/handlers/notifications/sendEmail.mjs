import { extractBody } from '../../../../../client/aws/utils/bodyExtractor.mjs';
import { sendEmail } from '../../../../../util/emailHelper.mjs';
import { sendResponse } from '../../../../../util/responseHelper.mjs';
import { HttpResponseCodes } from '../../../../../commons/web/webResponses.mjs';

exports.handle = async (event) => {

  try {
    const { body } = extractBody(event);
    await sendEmail(body, false);
    return sendResponse(HttpResponseCodes.OK);
  } catch (error) {
    console.log('error', e);
    return sendResponse(HttpResponseCodes.INTERNAL_SERVER_ERROR, error);
  }
};