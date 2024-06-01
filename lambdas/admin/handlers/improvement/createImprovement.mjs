import { HttpResponseCodes } from '../../../../commons/web/webResponses.mjs';
import { ImprovementRepository } from '../../../../persistence/repositories/improvementRepository.mjs';
import { ImprovementTable } from '../../../../persistence/tables/improvementTable.mjs';
import { UserRoles } from '../../../users/handlers/enrollment/constants.mjs';

import { execOnDatabase } from '../../../../util/dbHelper.mjs';
import { extractBody } from '../../../../client/aws/utils/bodyExtractor.mjs';
import { handleAdminError } from '../errorHandling.mjs';
import { sendResponse } from '../../../../util/responseHelper.mjs';
import { checkProps } from '../../../../util/propsGetter.mjs';

export const handle = async (event) => {

  const roles = event.requestContext.authorizer.claims.profile;
  if (roles !== UserRoles.ADMIN) return sendResponse(HttpResponseCodes.FORBIDDEN);

  const {body: newImprovement} = extractBody(event);
  if (!newImprovement) return sendResponse(HttpResponseCodes.BAD_REQUEST, {message: 'Missing data'});

  try {

    const props = ['name', 'description', 'price'];
    checkProps(newImprovement, props);

    const {entity, statement} = ImprovementRepository.insertStatement(newImprovement);

    const [savedImprovement] =
        await execOnDatabase({statement: statement, parameters: entity});

    return sendResponse(HttpResponseCodes.OK, ImprovementTable.rowToObject(savedImprovement));

  } catch (error) {
    return handleAdminError(error);
  }
};