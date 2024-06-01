import { HttpResponseCodes } from '../../../../commons/web/webResponses.mjs';
import { InstitutionRepository } from '../../../../persistence/repositories/institutionRepository.mjs';
import { InstitutionTable } from '../../../../persistence/tables/institutionTable.mjs';
import { UserRoles } from '../../../users/handlers/enrollment/constants.mjs';

import { execOnDatabase } from '../../../../util/dbHelper.mjs';
import { extractBody } from '../../../../client/aws/utils/bodyExtractor.mjs';
import { handleAdminError } from '../errorHandling.mjs';
import { sendResponse } from '../../../../util/responseHelper.mjs';
import { checkProps } from '../../../../util/propsGetter.mjs';
import { WagesRepository } from '../../../../persistence/repositories/wageRepository.mjs';
import { WagesTable } from '../../../../persistence/tables/wagesTable.mjs';

export const handle = async (event) => {

  const roles = event.requestContext.authorizer.claims.profile;
  if (roles !== UserRoles.ADMIN) return sendResponse(HttpResponseCodes.FORBIDDEN);

  const {body: newWage} = extractBody(event);
  if (!newWage) return sendResponse(HttpResponseCodes.BAD_REQUEST, {message: 'Missing data'});

  try {

    const props = ['description', 'level4', 'level3', 'level2'];
    checkProps(newWage, props);

    const {entity, statement} = WagesRepository.insertStatement(newWage);

    const [savedInstitution] =
        await execOnDatabase({statement: statement, parameters: entity});

    return sendResponse(HttpResponseCodes.OK, WagesTable.rowToObject(savedInstitution));

  } catch (error) {
    return handleAdminError(error);
  }
};