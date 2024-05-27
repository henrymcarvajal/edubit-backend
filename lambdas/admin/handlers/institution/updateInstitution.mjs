import { HttpResponseCodes } from '../../../../commons/web/webResponses.mjs';
import { InstitutionRepository } from '../../../../persistence/repositories/institutionRepository.mjs';
import { InstitutionTable } from '../../../../persistence/tables/institutionTable.mjs';
import { UserRoles } from '../../../users/handlers/enrollment/constants.mjs';
import { ValueValidationMessages } from '../../../../commons/messages.mjs';

import { execOnDatabase } from '../../../../util/dbHelper.mjs';
import { extractBody } from '../../../../client/aws/utils/bodyExtractor.mjs';
import { handleAdminError } from '../errorHandling.mjs';
import { sendResponse } from '../../../../util/lambdaHelper.mjs';
import { setFields } from '../../../commons/fieldOperations.mjs';
import { validate as uuidValidate } from 'uuid';

export const handle = async (event) => {

  const roles = event.requestContext.authorizer.claims.profile;
  if (roles !== UserRoles.ADMIN) return sendResponse(HttpResponseCodes.FORBIDDEN);

  const id = event.pathParameters.id;
  if (!uuidValidate(id)) return sendResponse(HttpResponseCodes.BAD_REQUEST, {message: `${ValueValidationMessages.VALUE_IS_NOT_UUID}: ${id}`});

  const {body: modifiedInstitution} = extractBody(event);

  if (!modifiedInstitution) return sendResponse(HttpResponseCodes.BAD_REQUEST, {message: 'Missing data'});
  if (modifiedInstitution.id !== id) return sendResponse(HttpResponseCodes.BAD_REQUEST, {message: 'Wrong data'});

  try {
    const [foundInstitution] = await InstitutionRepository.findById(id);
    if (!foundInstitution) return sendResponse(HttpResponseCodes.NOT_FOUND);

    setFields(modifiedInstitution, foundInstitution, 'name', 'levels', 'abilities', 'description');

    const {entity, statement} = InstitutionRepository.upsertStatement(foundInstitution);

    const [savedInstitution] =
        await execOnDatabase({statement: statement, parameters: entity});

    return sendResponse(HttpResponseCodes.OK, InstitutionTable.rowToObject(savedInstitution));

  } catch (error) {
    return handleAdminError(error);
  }
};