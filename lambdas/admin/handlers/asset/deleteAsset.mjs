import { AssetRepository } from '../../../../persistence/repositories/assetRepository.mjs';
import { AssetTable } from '../../../../persistence/tables/assetTable.mjs';
import { HttpResponseCodes } from '../../../../commons/web/webResponses.mjs';
import { UserRoles } from '../../../users/handlers/enrollment/constants.mjs';
import { ValueValidationMessages } from '../../../../commons/messages.mjs';

import { disable } from '../../../commons/fieldOperations.mjs';
import { execOnDatabase } from '../../../../util/dbHelper.mjs';
import { handleAdminError } from '../errorHandling.mjs';
import { sendResponse } from '../../../../util/lambdaHelper.mjs';
import { validate as uuidValidate } from 'uuid';

export const handle = async (event) => {

  const roles = event.requestContext.authorizer.claims.profile;
  if (roles !== UserRoles.ADMIN) return sendResponse(HttpResponseCodes.FORBIDDEN);

  const id = event.pathParameters.id;
  if (!uuidValidate(id)) return sendResponse(HttpResponseCodes.BAD_REQUEST, {message: `${ValueValidationMessages.VALUE_IS_NOT_UUID}: ${id}`});

  try {
    const [foundAsset] = await AssetRepository.findById(id);
    if (!foundAsset) return sendResponse(HttpResponseCodes.NOT_FOUND);

    disable(foundAsset);

    const {entity, statement} = AssetRepository.upsertStatement(foundAsset);

    const [savedAsset] =
        await execOnDatabase({statement: statement, parameters: entity});

    return sendResponse(HttpResponseCodes.OK, AssetTable.rowToObject(savedAsset));

  } catch (error) {
    return handleAdminError(error);
  }
};