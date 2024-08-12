import { HttpResponseCodes } from '../../../../commons/web/webResponses.mjs';
import { ValueValidationMessages } from '../../../../commons/messages.mjs';

import { authorizeAndFindParticipant } from '../../authorizers/participantAuthorizer.mjs';
import { handleErrorResponse } from '../../../commons/errorHandling.mjs';
import { sendResponse } from '../../../../util/responseHelper.mjs';
import { validate as uuidValidate } from 'uuid';

import { InvalidInputError } from '../../../commons/errors/data/input.mjs';

exports.handle = async (event) => {
  try {
    const participantId = validateAndExtractParams(event);
    const foundParticipant = await authorizeAndFindParticipant(event, participantId);
    return sendResponse(HttpResponseCodes.OK, foundParticipant);
  } catch (error) {
    return handleErrorResponse(error);
  }
};

const validateAndExtractParams = (event) => {
  const { id: participantId } = event.pathParameters;
  if (!uuidValidate(participantId)) {
    throw new InvalidInputError(`${ ValueValidationMessages.VALUE_IS_NOT_UUID } (participantId)}: ${ participantId }`);
  }
  return participantId;
};