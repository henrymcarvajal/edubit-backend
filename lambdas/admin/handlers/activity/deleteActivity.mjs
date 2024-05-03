import { ActivityRepository } from '../../../../persistence/repositories/activityRepository.mjs';
import { ActivityTable } from '../../../../persistence/tables/activityTable.mjs';
import { HttpResponseCodes } from '../../../../commons/web/webResponses.mjs';
import { UserRoles } from '../../../users/handlers/enrollment/constants.mjs';
import { ValueValidationMessages } from '../../../../commons/messages.mjs';

import { disable } from '../../../commons/fieldOperations.mjs';
import { execOnDatabase } from '../../../../util/dbHelper.mjs';
import { handleAdminError } from '../errorHandling.mjs';
import { isUUID } from '../../../../commons/validations.mjs';
import { sendResponse } from '../../../../util/lambdaHelper.mjs';

export const handle = async (event) => {

  const roles = event.requestContext.authorizer.claims.profile;
  if (roles !== UserRoles.ADMIN) return sendResponse(HttpResponseCodes.FORBIDDEN);

  const id = event.pathParameters.id;
  if (!isUUID(id)) return sendResponse(HttpResponseCodes.BAD_REQUEST, {message: `${ValueValidationMessages.VALUE_IS_NOT_UUID}: ${id}`});

  try {
    const [foundActivity] = await ActivityRepository.findById(id);
    if (!foundActivity) return sendResponse(HttpResponseCodes.NOT_FOUND);

    disable(foundActivity);

    const {entity, statement} = ActivityRepository.upsertStatement(foundActivity);

    const [savedActivity] =
        await execOnDatabase({statement: statement, parameters: entity});

    return sendResponse(HttpResponseCodes.OK, ActivityTable.rowToObject(savedActivity));

  } catch (error) {
    return handleAdminError(error);
  }
};