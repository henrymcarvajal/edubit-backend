import { HttpResponseCodes } from '../../../../commons/web/webResponses.mjs';
import { MentorRepository } from '../../../../persistence/repositories/mentorRepository.mjs';
import { MentorTable } from '../../../../persistence/tables/mentorTable.mjs';
import { ValueValidationMessages } from '../../../../commons/messages.mjs';

import { authorizeAndFindMentor } from '../../authorizers/mentorAuthorizer.mjs';
import { checkMobileNumberFormat } from '../../../../util/generalValidations.mjs';
import { execOnDatabase } from '../../../../util/dbHelper.mjs';
import { extractBody } from '../../../../client/aws/utils/bodyExtractor.mjs';
import { handleErrorResponse } from '../../../commons/errorHandling.mjs';
import { sendResponse } from '../../../../util/responseHelper.mjs';
import { validate as uuidValidate } from 'uuid';
import { validateActivities } from '../../../commons/validations/validations.mjs';

import { InvalidInputError } from '../../../commons/errors/data/input.mjs';

export const handle = async (event) => {
  try {
    const { mentorId, modifiedMentor } = validateAndExtractParams(event);
    const foundMentor = await authorizeAndFindMentor(event, mentorId);

    await updateMentor(foundMentor, modifiedMentor);
    const savedMentor = await saveMentor(foundMentor);

    return sendResponse(HttpResponseCodes.OK, savedMentor);
  } catch (error) {
    return handleErrorResponse(error);
  }
};

const validateAndExtractParams = (event) => {
  const { id: mentorId } = event.pathParameters;
  if (!uuidValidate(mentorId)) {
    throw new InvalidInputError(`${ ValueValidationMessages.VALUE_IS_NOT_UUID } (mentorId)}: ${ mentorId }`);
  }

  const { body: modifiedMentor } = extractBody(event);
  if (!modifiedMentor) {
    throw new InvalidInputError('Missing mentor data');
  }

  return { mentorId, modifiedMentor };
};

const updateMentor = async (foundMentor, modifiedMentor) => {
  if (Object.keys(modifiedMentor.activities).length && JSON.stringify(foundMentor.activities) !== JSON.stringify(modifiedMentor.activities)) {
    await validateActivities(modifiedMentor.activities);
    foundMentor.activities = modifiedMentor.activities;
    foundMentor.modificationDate = new Date();
  }
  if (modifiedMentor.phone && foundMentor.phone !== modifiedMentor.phone) {
    checkMobileNumberFormat(modifiedMentor.phone);
    foundMentor.phone = modifiedMentor.phone;
    foundMentor.modificationDate = new Date();
  }
};

const saveMentor = async (modifiedMentor) => {
  const { entity, statement } = MentorRepository.upsertStatement(modifiedMentor);
  const [savedMentor] =
      await execOnDatabase({ statement: statement, parameters: entity });
  return MentorTable.rowToObject(savedMentor);
};