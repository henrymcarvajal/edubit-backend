import { HttpResponseCodes } from '../../../../commons/web/webResponses.mjs';
import { UserRoles } from '../../../users/handlers/enrollment/constants.mjs';
import { ValueValidationMessages } from '../../../../commons/messages.mjs';
import { WorkshopExecutionRepository } from '../../../../persistence/repositories/workshopExecutionRepository.mjs';
import { WorkshopExecutionTable } from '../../../../persistence/tables/workshopExecutionModel.mjs';

import { extractBody } from '../../../../client/aws/utils/bodyExtractor.mjs';
import { execOnDatabase } from '../../../../util/dbHelper.mjs';
import { handleWorkshopError } from '../errorHandling.mjs';
import { sendResponse } from '../../../../util/lambdaHelper.mjs';
import { setFields } from '../../../commons/fieldOperations.mjs';
import { validate as uuidValidate } from 'uuid';

export const handle = async (event) => {

  const roles = event.requestContext.authorizer.claims.profile;
  if (roles !== UserRoles.ADMIN) return sendResponse(HttpResponseCodes.FORBIDDEN);

  const id = event.pathParameters.id;
  if (!uuidValidate(id)) return sendResponse(HttpResponseCodes.BAD_REQUEST, {message: `${ValueValidationMessages.VALUE_IS_NOT_UUID}: ${id}`});

  const {body: modifiedWorkshopExecution} = extractBody(event);
  if (!modifiedWorkshopExecution) return sendResponse(HttpResponseCodes.BAD_REQUEST, {message: 'Missing data'});
  if (modifiedWorkshopExecution.id !== id) return sendResponse(HttpResponseCodes.BAD_REQUEST, {message: 'Ids do not match'});

  try {

    const [foundWorkshopExecution] = await WorkshopExecutionRepository.findById(id);
    if (!foundWorkshopExecution) return sendResponse(HttpResponseCodes.NOT_FOUND, null);

    if (!foundWorkshopExecution.startTimestamp) {
      setFields(modifiedWorkshopExecution, foundWorkshopExecution, 'scheduledDate', 'institutionId', 'workshopDefinitionId', 'activities');
    } else {
      return sendResponse(HttpResponseCodes.CONFLICT);
    }

    const {entity, statement} = WorkshopExecutionRepository.upsertStatement(foundWorkshopExecution);

    const [savedWorkshop] =
        await execOnDatabase({statement: statement, parameters: entity});

    return sendResponse(HttpResponseCodes.OK, WorkshopExecutionTable.rowToObject(savedWorkshop));

  } catch (error) {
    return handleWorkshopError(error);
  }
};