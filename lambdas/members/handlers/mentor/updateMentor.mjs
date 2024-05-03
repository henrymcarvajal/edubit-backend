import { HttpResponseCodes } from '../../../../commons/web/webResponses.mjs';
import { MentorRepository } from '../../../../persistence/repositories/mentorRepository.mjs';
import { MentorTable } from '../../../../persistence/tables/mentorTable.mjs';
import { ValueValidationMessages } from '../../../../commons/messages.mjs';

import { authorizeAndFindMentor } from './mentorAuthorizer.mjs';
import { checkMobileNumberFormat } from '../../../../util/generalValidations.mjs';
import { execOnDatabase } from '../../../../util/dbHelper.mjs';
import { extractBody } from '../../../../client/aws/utils/bodyExtractor.mjs';
import { handleMembersError } from '../errorHandling.mjs';
import { isUUID } from '../../../../commons/validations.mjs';
import { sendResponse } from '../../../../util/lambdaHelper.mjs';
import { validateActivities } from '../../../commons/validations/validations.mjs';

export const handle = async (event) => {

  const id = event.pathParameters.id;
  if (!isUUID(id)) return sendResponse(HttpResponseCodes.BAD_REQUEST, {message: `${ValueValidationMessages.VALUE_IS_NOT_UUID}: ${id}`});

  const {profile: roles, email} = event.requestContext.authorizer.claims;
  const {mentor: foundMentor, response} = await authorizeAndFindMentor(roles, id, email);
  if (response) return response;

  const {body: modifiedMentor} = extractBody(event);
  if (!modifiedMentor) return sendResponse(HttpResponseCodes.BAD_REQUEST, {message: 'Missing data'});

  try {

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

    const {entity, statement} = MentorRepository.upsertStatement(foundMentor);

    const [savedMentor] =
        await execOnDatabase({statement: statement, parameters: entity});

    return sendResponse(HttpResponseCodes.OK, MentorTable.rowToObject(savedMentor));

  } catch (error) {
    return handleMembersError(error);
  }
};