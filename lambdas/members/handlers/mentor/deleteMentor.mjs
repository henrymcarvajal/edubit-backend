import { HttpResponseCodes } from '../../../../commons/web/webResponses.mjs';
import MentorRepository from '../../../../persistence/repositories/mentorRepository.mjs';
import { ValueValidationMessages } from '../../../../commons/messages.mjs';

import { authorizeAndFindMentor } from '../../authorizers/mentorAuthorizer.mjs';
import { execOnDatabase } from '../../../../util/dbHelper.mjs';
import { handleErrorResponse } from '../../../commons/errorHandling.mjs';
import { sendResponse } from '../../../../util/responseHelper.mjs';
import { validate as uuidValidate } from 'uuid';

import { InvalidInputError } from '../../../commons/errors/data/input.mjs';

exports.handle = async (event) => {
  try {
    const mentorId = validateAndExtractParams(event);
    const foundMentor = await authorizeAndFindMentor(event, mentorId);

    updateMentor(foundMentor);
    await saveMentor(foundMentor);

    return sendResponse(HttpResponseCodes.NO_CONTENT);
  } catch (error) {
    return handleErrorResponse(error);
  }
};

const validateAndExtractParams = (event) => {
  const { id: mentorId } = event.pathParameters;
  if (!uuidValidate(mentorId)) {
    throw new InvalidInputError(`${ ValueValidationMessages.VALUE_IS_NOT_UUID } (mentorId)}: ${ mentorId }`);
  }
  return mentorId;
};

const updateMentor = (mentor) => {
  mentor.enabled = false;
  mentor.disabledDate = new Date();
};

const saveMentor = async (mentor) => {
  const { statement, entity } = MentorRepository.upsertStatement(mentor);
  await execOnDatabase({ statement: statement, parameters: entity });
}