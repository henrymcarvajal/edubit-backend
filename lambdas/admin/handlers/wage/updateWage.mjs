import { HttpResponseCodes } from '../../../../commons/web/webResponses.mjs';
import { UserRoles } from '../../../users/handlers/enrollment/constants.mjs';
import { ValueValidationMessages } from '../../../../commons/messages.mjs';
import { WagesRepository } from '../../../../persistence/repositories/wageRepository.mjs';
import { WagesTable } from '../../../../persistence/tables/wagesTable.mjs';

import { execOnDatabase } from '../../../../util/dbHelper.mjs';
import { extractBody } from '../../../../client/aws/utils/bodyExtractor.mjs';
import { handleAdminError } from '../errorHandling.mjs';
import { sendResponse } from '../../../../util/responseHelper.mjs';
import { setFields } from '../../../commons/fieldOperations.mjs';
import { validate as uuidValidate } from 'uuid';

export const handle = async (event) => {

  const roles = event.requestContext.authorizer.claims.profile;
  if (roles !== UserRoles.ADMIN) return sendResponse(HttpResponseCodes.FORBIDDEN);

  const id = event.pathParameters.id;
  if (!uuidValidate(id)) return sendResponse(HttpResponseCodes.BAD_REQUEST, {message: `${ValueValidationMessages.VALUE_IS_NOT_UUID}: ${id}`});

  const {body: modifiedWage} = extractBody(event);

  if (!modifiedWage) return sendResponse(HttpResponseCodes.BAD_REQUEST, {message: 'Missing data'});
  if (modifiedWage.id !== id) return sendResponse(HttpResponseCodes.BAD_REQUEST, {message: 'Wrong data'});

  try {
    const [foundWage] = await WagesRepository.findById(id);
    if (!foundWage) return sendResponse(HttpResponseCodes.NOT_FOUND);

    setFields(modifiedWage, foundWage, 'name', 'levels', 'abilities', 'description');

    const {entity, statement} = WagesRepository.upsertStatement(foundWage);

    const [savedWage] =
        await execOnDatabase({statement: statement, parameters: entity});

    return sendResponse(HttpResponseCodes.OK, WagesTable.rowToObject(savedWage));

  } catch (error) {
    return handleAdminError(error);
  }
};