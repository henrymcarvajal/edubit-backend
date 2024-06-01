import { HttpResponseCodes } from '../../../../commons/web/webResponses.mjs';
import { ImprovementRepository } from '../../../../persistence/repositories/improvementRepository.mjs';
import { ImprovementTable } from '../../../../persistence/tables/improvementTable.mjs';
import { UserRoles } from '../../../users/handlers/enrollment/constants.mjs';
import { ValueValidationMessages } from '../../../../commons/messages.mjs';

import { disable } from '../../../commons/fieldOperations.mjs';
import { execOnDatabase } from '../../../../util/dbHelper.mjs';
import { handleAdminError } from '../errorHandling.mjs';
import { sendResponse } from '../../../../util/responseHelper.mjs';
import { validate as uuidValidate } from 'uuid';

export const handle = async (event) => {

  const roles = event.requestContext.authorizer.claims.profile;
  if (roles !== UserRoles.ADMIN) return sendResponse(HttpResponseCodes.FORBIDDEN);

  const id = event.pathParameters.id;
  if (!uuidValidate(id)) return sendResponse(HttpResponseCodes.BAD_REQUEST, {message: `${ValueValidationMessages.VALUE_IS_NOT_UUID}: ${id}`});

  try {
    const [foundImprovement] = await ImprovementRepository.findById(id);
    if (!foundImprovement) return sendResponse(HttpResponseCodes.NOT_FOUND);

    disable(foundImprovement);

    const {entity, statement} = ImprovementRepository.upsertStatement(foundImprovement);

    const [savedAsset] =
        await execOnDatabase({statement: statement, parameters: entity});

    return sendResponse(HttpResponseCodes.OK, ImprovementTable.rowToObject(savedAsset));

  } catch (error) {
    return handleAdminError(error);
  }
};