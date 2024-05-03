import { AssetRepository } from '../../../../persistence/repositories/assetRepository.mjs';
import { AssetTable } from '../../../../persistence/tables/assetTable.mjs';
import { HttpResponseCodes } from '../../../../commons/web/webResponses.mjs';
import { UserRoles } from '../../../users/handlers/enrollment/constants.mjs';
import { ValueValidationMessages } from '../../../../commons/messages.mjs';

import { execOnDatabase } from '../../../../util/dbHelper.mjs';
import { extractBody } from '../../../../client/aws/utils/bodyExtractor.mjs';
import { handleAdminError } from '../errorHandling.mjs';
import { isUUID } from '../../../../commons/validations.mjs';
import { sendResponse } from '../../../../util/lambdaHelper.mjs';
import { setFields } from '../../../commons/fieldOperations.mjs';

export const handle = async (event) => {

  const roles = event.requestContext.authorizer.claims.profile;
  if (roles !== UserRoles.ADMIN) return sendResponse(HttpResponseCodes.FORBIDDEN);

  const id = event.pathParameters.id;
  if (!isUUID(id)) return sendResponse(HttpResponseCodes.BAD_REQUEST, {message: `${ValueValidationMessages.VALUE_IS_NOT_UUID}: ${id}`});

  const {body: modifiedAsset} = extractBody(event);
  if (!modifiedAsset) return sendResponse(HttpResponseCodes.BAD_REQUEST, {message: 'Missing data'});
  if (modifiedAsset.id !== id) return sendResponse(HttpResponseCodes.BAD_REQUEST, {message: 'Wrong data'});

  try {
    const [foundAsset] = await AssetRepository.findById(id);
    if (!foundAsset) return sendResponse(HttpResponseCodes.NOT_FOUND);

    setFields(modifiedAsset, foundAsset, 'title', 'price', 'description');

    const {entity, statement} = AssetRepository.upsertStatement(foundAsset);

    const [savedAsset] =
        await execOnDatabase({statement: statement, parameters: entity});

    return sendResponse(HttpResponseCodes.OK, AssetTable.rowToObject(savedAsset));

  } catch (error) {
    return handleAdminError(error);
  }
};