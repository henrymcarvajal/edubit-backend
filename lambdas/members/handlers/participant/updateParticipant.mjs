import { HttpResponseCodes } from '../../../../commons/web/webResponses.mjs';
import { ParticipantRepository } from '../../../../persistence/repositories/participantRepository.mjs';
import { ParticipantTable } from '../../../../persistence/tables/participantTable.mjs';
import { ValueValidationMessages } from '../../../../commons/messages.mjs';

import { authorizeAndFindParticipant } from './participantAuthorizer.mjs';
import { checkMobileNumberFormat, validateEmail } from '../../../../util/generalValidations.mjs';
import { checkGrade } from '../../../users/handlers/enrollment/validations/validations.mjs';
import { extractBody } from '../../../../client/aws/utils/bodyExtractor.mjs';
import { execOnDatabase } from '../../../../util/dbHelper.mjs';
import { handleMembersError } from '../errorHandling.mjs';
import { isUUID } from '../../../../commons/validations.mjs';
import { sendResponse } from '../../../../util/lambdaHelper.mjs';
import { validateActivities } from '../../../commons/validations/validations.mjs';

export const handle = async (event) => {

  const id = event.pathParameters.id;
  if (!isUUID(id)) return sendResponse(HttpResponseCodes.BAD_REQUEST, {message: `${ValueValidationMessages.VALUE_IS_NOT_UUID}: ${id}`});

  const {profile: roles, email} = event.requestContext.authorizer.claims;
  const {participant: foundParticipant, response} = await authorizeAndFindParticipant(roles, id, email);
  if (response) return response;

  const {body: modifiedParticipant} = extractBody(event);
  if (!modifiedParticipant) return sendResponse(HttpResponseCodes.BAD_REQUEST, {message: 'Missing data'});

  try {

    if (modifiedParticipant.grade && foundParticipant.grade !== modifiedParticipant.grade) {
      checkGrade(modifiedParticipant.grade);
      foundParticipant.grade = modifiedParticipant.grade;
      foundParticipant.modificationDate = new Date();
    }
    if (Object.keys(modifiedParticipant.activities).length && JSON.stringify(foundParticipant.activities) !== JSON.stringify(modifiedParticipant.activities)) {
      await validateActivities(modifiedParticipant.activities);
      foundParticipant.activities = modifiedParticipant.activities;
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

    const {entity, statement} = ParticipantRepository.upsertStatement(foundParticipant);

    const [savedParticipant] =
        await execOnDatabase({statement: statement, parameters: entity});

    return sendResponse(HttpResponseCodes.OK, ParticipantTable.rowToObject(savedParticipant));

  } catch (error) {
    return handleMembersError(error);
  }
};