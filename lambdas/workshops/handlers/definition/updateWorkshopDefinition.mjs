import { HttpResponseCodes } from '../../../../commons/web/webResponses.mjs';
import { UserRoles } from '../../../users/handlers/enrollment/constants.mjs';
import { ValueValidationMessages } from '../../../../commons/messages.mjs';
import { WorkshopDefinitionRepository } from '../../../../persistence/repositories/workshopDefinitionRepository.mjs';
import { WorkshopDefinitionTable } from '../../../../persistence/tables/workshopDefinitionTable.mjs';

import { extractBody } from '../../../../client/aws/utils/bodyExtractor.mjs';
import { execOnDatabase } from '../../../../util/dbHelper.mjs';
import { handleWorkshopError } from '../errorHandling.mjs';
import { sendResponse } from '../../../../util/lambdaHelper.mjs';
import { validate as uuidValidate } from 'uuid';

export const handle = async (event) => {

  const roles = event.requestContext.authorizer.claims.profile;
  if (roles !== UserRoles.ADMIN) return sendResponse(HttpResponseCodes.FORBIDDEN);

  const id = event.pathParameters.id;
  if (!uuidValidate(id)) return sendResponse(HttpResponseCodes.BAD_REQUEST, {message: `${ValueValidationMessages.VALUE_IS_NOT_UUID}: ${id}`});

  const {body: modifiedWorkshop} = extractBody(event);
  if (!modifiedWorkshop) return sendResponse(HttpResponseCodes.BAD_REQUEST, {message: 'Missing data'});
  if (modifiedWorkshop.id !== id) return sendResponse(HttpResponseCodes.BAD_REQUEST, {message: 'Ids do not match'});

  try {

    const [foundWorkshop] = await WorkshopDefinitionRepository.findById(id);
    if (!foundWorkshop) return sendResponse(HttpResponseCodes.NOT_FOUND, null);

    if (foundWorkshop.name !== modifiedWorkshop.name) {
      foundWorkshop.name = modifiedWorkshop.name;
      foundWorkshop.modificationDate = new Date();
    }
    if (foundWorkshop.schedule !== modifiedWorkshop.schedule) {
      foundWorkshop.schedule = modifiedWorkshop.schedule;
      foundWorkshop.modificationDate = new Date();
    }
    if (foundWorkshop.enabled !== modifiedWorkshop.enabled) {
      foundWorkshop.enabled = modifiedWorkshop.enabled;
      foundWorkshop.modificationDate = new Date();
      foundWorkshop.disabledDate = new Date();
    }

    const {entity, statement} = WorkshopDefinitionRepository.upsertStatement(foundWorkshop);

    const [savedWorkshop] =
        await execOnDatabase({statement: statement, parameters: entity});

    return sendResponse(HttpResponseCodes.OK, WorkshopDefinitionTable.rowToObject(savedWorkshop));

  } catch (error) {
    return handleWorkshopError(error);
  }
};