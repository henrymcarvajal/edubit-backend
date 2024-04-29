import { HttpResponseCodes } from '../../../../commons/web/webResponses.mjs';
import { MentorRepository } from '../../../../persistence/repositories/mentorRepository.mjs';
import { MentorTable } from '../../../../persistence/tables/mentorTable.mjs';

import { authorizeAndFindMentor } from './mentorAuthorizer.mjs';
import { execOnDatabase } from '../../../../util/dbHelper.mjs';
import { handleMembersError } from '../errorHandling.mjs';
import { sendResponse } from '../../../../util/lambdaHelper.mjs';

export const handle = async (event) => {

  const id = event.pathParameters.id;
  const {profile: roles, email} = event.requestContext.authorizer.claims;

  try {
    const {mentor: foundMentor, response} = await authorizeAndFindMentor(roles, id, email);
    if (response) return response;

    foundMentor.enabled = false;
    foundMentor.disabledDate = new Date();

    const {statement, entity} = MentorRepository.upsertStatement(foundMentor);

    const [savedMentor] =
        await execOnDatabase({statement: statement, parameters: entity});

    return sendResponse(HttpResponseCodes.OK, MentorTable.rowToObject(savedMentor));

  } catch (error) {
    return handleMembersError(error);
  }
};