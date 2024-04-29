import { HttpResponseCodes } from '../../../../commons/web/webResponses.mjs';
import { UserRoles } from '../../../users/handlers/enrollment/constants.mjs';
import { WorkshopExecutionRepository } from '../../../../persistence/repositories/workshopExecutionRepository.mjs';
import { WorkshopExecutionTable } from '../../../../persistence/tables/workshopExecutionTable.mjs';

import { checkProps } from '../../../../util/propsGetter.mjs';
import { execOnDatabase } from '../../../../util/dbHelper.mjs';
import { extractBody } from '../../../../client/aws/utils/bodyExtractor.mjs';
import { handleWorkshopError } from '../errorHandling.mjs';
import { sendResponse } from '../../../../util/lambdaHelper.mjs';

export const handle = async (event) => {

  const roles = event.requestContext.authorizer.claims.profile;
  if (roles !== UserRoles.ADMIN) return sendResponse(HttpResponseCodes.FORBIDDEN);

  const {body: workshopExecution} = extractBody(event);

  if (!workshopExecution) return sendResponse(HttpResponseCodes.BAD_REQUEST, {message: 'Missing data'});

  try {

    let props = ['scheduledDate', 'institutionId', 'workshopDefinitionId', 'activities'];
    checkProps(workshopExecution, props);

    const {statement, entity} = WorkshopExecutionRepository.insertStatement(workshopExecution);

    const [savedWorkshopExecution] =
        await execOnDatabase({statement: statement, parameters: entity});

    return sendResponse(HttpResponseCodes.OK, WorkshopExecutionTable.rowToObject(savedWorkshopExecution));

  } catch (error) {
    return handleWorkshopError(error);
  }
};