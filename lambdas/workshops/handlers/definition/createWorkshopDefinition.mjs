import { HttpResponseCodes } from '../../../../commons/web/webResponses.mjs';
import { UserRoles } from '../../../users/handlers/enrollment/constants.mjs';
import { WorkshopDefinitionRepository } from '../../../../persistence/repositories/workshopDefinitionRepository.mjs';
import { WorkshopDefinitionTable } from '../../../../persistence/tables/workshopDefinitionTable.mjs';

import { checkProps } from '../../../../util/propsGetter.mjs';
import { execOnDatabase } from '../../../../util/dbHelper.mjs';
import { extractBody } from '../../../../client/aws/utils/bodyExtractor.mjs';
import { handleWorkshopError } from '../errorHandling.mjs';
import { sendResponse } from '../../../../util/responseHelper.mjs';

export const handle = async (event) => {

  const roles = event.requestContext.authorizer.claims.profile;
  if (roles !== UserRoles.ADMIN) return sendResponse(HttpResponseCodes.FORBIDDEN);

  const {body: workshop} = extractBody(event);

  if (!workshop) return sendResponse(HttpResponseCodes.BAD_REQUEST, {message: 'Missing data'});

  try {

    let props = ['name', 'schedule'];
    checkProps(workshop, props);

    const {statement, entity} = WorkshopDefinitionRepository.insertStatement(workshop);

    const [savedWorkshopRow] =
        await execOnDatabase({statement: statement, parameters: entity});

    return sendResponse(HttpResponseCodes.OK, WorkshopDefinitionTable.rowToObject(savedWorkshopRow));

  } catch (error) {
    return handleWorkshopError(error);
  }
};