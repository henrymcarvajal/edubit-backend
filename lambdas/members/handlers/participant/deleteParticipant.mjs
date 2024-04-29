import { HttpResponseCodes } from '../../../../commons/web/webResponses.mjs';
import { ParticipantRepository } from '../../../../persistence/repositories/participantRepository.mjs';
import { ParticipantTable } from '../../../../persistence/tables/participantTable.mjs';

import { authorizeAndFindParticipant } from './participantAuthorizer.mjs';
import { execOnDatabase } from '../../../../util/dbHelper.mjs';
import { handleMembersError } from '../errorHandling.mjs';
import { sendResponse } from '../../../../util/lambdaHelper.mjs';

export const handle = async (event) => {

  const id = event.pathParameters.id;
  const {profile: roles, email} = event.requestContext.authorizer.claims;

  try {
    const {participant: foundParticipant, response} = await authorizeAndFindParticipant(roles, id, email);
    if (response) return response;

    foundParticipant.enabled = false;
    foundParticipant.disabledDate = new Date();

    const {statement, entity} = ParticipantRepository.upsertStatement(foundParticipant);

    const [savedParticipant] =
        await execOnDatabase({statement: statement, parameters: entity});

    return sendResponse(HttpResponseCodes.OK, ParticipantTable.rowToObject(savedParticipant));

  } catch (error) {
    return handleMembersError(error);
  }
};