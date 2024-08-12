import ParticipantRepository from '../../../../persistence/repositories/participantRepository.mjs';
import ParticipantTable from '../../../../persistence/tables/participantTable.mjs';
import { HttpResponseCodes } from '../../../../commons/web/webResponses.mjs';
import { ValueValidationMessages } from '../../../../commons/messages.mjs';

import { authorizeAndFindParticipant } from '../../authorizers/participantAuthorizer.mjs';
import { checkMobileNumberFormat, validateEmail } from '../../../../util/generalValidations.mjs';
import { checkGrade } from '../../../users/handlers/enrollment/validations/validations.mjs';
import { extractBody } from '../../../../client/aws/utils/bodyExtractor.mjs';
import { execOnDatabase } from '../../../../util/dbHelper.mjs';
import { handleErrorResponse } from '../../../commons/errorHandling.mjs';
import { sendResponse } from '../../../../util/responseHelper.mjs';
import { validate as uuidValidate } from 'uuid';

import { InvalidInputError } from '../../../commons/errors/data/input.mjs';

exports.handle = async (event) => {
  try {
    const { participantId, modifiedParticipant } = validateAndExtractParams(event);
    const foundParticipant = await authorizeAndFindParticipant(event, participantId);

    await updateParticipant(foundParticipant, modifiedParticipant);
    const savedParticipant = await saveParticipant(foundParticipant);

    return sendResponse(HttpResponseCodes.OK, savedParticipant);
  } catch (error) {
    return handleErrorResponse(error);
  }
};

const validateAndExtractParams = (event) => {
  const { id: participantId } = event.pathParameters;
  if (!uuidValidate(participantId)) {
    throw new InvalidInputError(`${ ValueValidationMessages.VALUE_IS_NOT_UUID } (mentorId)}: ${ participantId }`);
  }

  const { body: modifiedParticipant } = extractBody(event);
  if (!modifiedParticipant) {
    throw new InvalidInputError('Missing participant data');
  }

  return { participantId, modifiedParticipant };
};

const updateParticipant = async (foundParticipant, modifiedParticipant) => {
  if (modifiedParticipant.grade && foundParticipant.grade !== modifiedParticipant.grade) {
    checkGrade(modifiedParticipant.grade);
    foundParticipant.grade = modifiedParticipant.grade;
    foundParticipant.modificationDate = new Date();
  }
  if (modifiedParticipant.parentEmail && foundParticipant.parentEmail !== modifiedParticipant.parentEmail) {
    await validateEmail(modifiedParticipant.parentEmail);
    foundParticipant.parentEmail = modifiedParticipant.parentEmail;
    foundParticipant.modificationDate = new Date();
  }
  if (modifiedParticipant.parentPhone && foundParticipant.parentPhone !== modifiedParticipant.parentPhone) {
    checkMobileNumberFormat(modifiedParticipant.parentPhone);
    foundParticipant.parentPhone = modifiedParticipant.parentPhone;
    foundParticipant.modificationDate = new Date();
  }
};

const saveParticipant = async (modifiedParticipant) => {
  const { entity, statement } = ParticipantRepository.upsertStatement(modifiedParticipant);
  const [savedParticipant] =
      await execOnDatabase({ statement: statement, parameters: entity });
  return ParticipantTable.rowToObject(savedParticipant);
};