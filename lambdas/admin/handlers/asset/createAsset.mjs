import { AssetRepository } from '../../../../persistence/repositories/assetRepository.mjs';
import { AssetTable } from '../../../../persistence/tables/assetTable.mjs';
import { HttpResponseCodes } from '../../../../commons/web/webResponses.mjs';
import { UserRoles } from '../../../users/handlers/enrollment/constants.mjs';

import { execOnDatabase } from '../../../../util/dbHelper.mjs';
import { extractBody } from '../../../../client/aws/utils/bodyExtractor.mjs';
import { handleAdminError } from '../errorHandling.mjs';
import { sendResponse } from '../../../../util/lambdaHelper.mjs';
import { checkProps } from '../../../../util/propsGetter.mjs';

export const handle = async (event) => {

  const roles = event.requestContext.authorizer.claims.profile;
  if (roles !== UserRoles.ADMIN) return sendResponse(HttpResponseCodes.FORBIDDEN);

  const {body: newAsset} = extractBody(event);
  if (!newAsset) return sendResponse(HttpResponseCodes.BAD_REQUEST, {message: 'Missing data'});

  try {

    const props = ['title', 'description', 'price'];
    checkProps(newAsset, props);

    const {entity, statement} = AssetRepository.insertStatement(newAsset);

    const [savedAsset] =
        await execOnDatabase({statement: statement, parameters: entity});

    return sendResponse(HttpResponseCodes.OK, AssetTable.rowToObject(savedAsset));

  } catch (error) {
    return handleAdminError(error);
  }
};