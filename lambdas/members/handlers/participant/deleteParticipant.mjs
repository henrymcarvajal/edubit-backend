import { HttpResponseCodes } from '../../../../commons/web/webResponses.mjs';
import { ParticipantRepository } from '../../../../persistence/repositories/participantRepository.mjs';
import { ValueValidationMessages } from '../../../../commons/messages.mjs';

import { authorizeAndFindParticipant } from '../../authorizers/participantAuthorizer.mjs';
import { execOnDatabase } from '../../../../util/dbHelper.mjs';
import { handleErrorResponse } from '../../../commons/errorHandling.mjs';
import { sendResponse } from '../../../../util/responseHelper.mjs';
import { validate as uuidValidate } from 'uuid';

import { InvalidInputError } from '../../../commons/errors/data/input.mjs';

export const handle = async (event) => {
  try {
    const participantId = validateAndExtractParams(event);
    const foundParticipant = await authorizeAndFindParticipant(event, participantId);

    updateParticipant(foundParticipant);
    await saveParticipant(foundParticipant);

    return sendResponse(HttpResponseCodes.NO_CONTENT);
  } catch (error) {
    return handleErrorResponse(error);
  }
};

const validateAndExtractParams = (event) => {
  const { id: participantId } = event.pathParameters;
  if (!uuidValidate(participantId)) {
    throw new InvalidInputError(`${ ValueValidationMessages.VALUE_IS_NOT_UUID } (participantIdd)}: ${ participantId }`);
  }
  return participantId;
};

const updateParticipant = (participant) => {
  participant.enabled = false;
  participant.disabledDate = new Date();
};

const saveParticipant = async (participant) => {
  const { statement, entity } = ParticipantRepository.upsertStatement(participant);
  await execOnDatabase({ statement: statement, parameters: entity });
};