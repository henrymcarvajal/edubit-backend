import { HttpResponseCodes } from '../../../../commons/web/webResponses.mjs';
import { InstitutionRepository } from '../../../../persistence/repositories/institutionRepository.mjs';
import { InstitutionTable } from '../../../../persistence/tables/institutionTable.mjs';
import { UserRoles } from '../../../users/handlers/enrollment/constants.mjs';
import { ValueValidationMessages } from '../../../../commons/messages.mjs';

import { disable } from '../../../commons/fieldOperations.mjs';
import { execOnDatabase } from '../../../../util/dbHelper.mjs';
import { handleAdminError } from '../errorHandling.mjs';
import { isUUID } from '../../../../commons/validations.mjs';
import { sendResponse } from '../../../../util/lambdaHelper.mjs';

export const handle = async (event) => {

  const roles = event.requestContext.authorizer.claims.profile;
  if (roles !== UserRoles.ADMIN) return sendResponse(HttpResponseCodes.FORBIDDEN);

  const id = event.pathParameters.id;
  if (!isUUID(id)) return sendResponse(HttpResponseCodes.BAD_REQUEST, {message: `${ValueValidationMessages.VALUE_IS_NOT_UUID}: ${id}`});

  try {
    const [foundInstitution] = await InstitutionRepository.findById(id);
    if (!foundInstitution) return sendResponse(HttpResponseCodes.NOT_FOUND);

    disable(foundInstitution);

    const {entity, statement} = InstitutionRepository.upsertStatement(foundInstitution);

    const [savedInstitution] =
        await execOnDatabase({statement: statement, parameters: entity});

    return sendResponse(HttpResponseCodes.OK, InstitutionTable.rowToObject(savedInstitution));

  } catch (error) {
    return handleAdminError(error);
  }
};