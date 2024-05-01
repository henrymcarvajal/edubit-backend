import { ActivityRepository } from '../../../../persistence/repositories/activityRepository.mjs';
import { ActivityTable } from '../../../../persistence/tables/activityTable.mjs';
import { HttpResponseCodes } from '../../../../commons/web/webResponses.mjs';
import { UserRoles } from '../../../users/handlers/enrollment/constants.mjs';

import { extractBody } from '../../../../client/aws/utils/bodyExtractor.mjs';
import { execOnDatabase } from '../../../../util/dbHelper.mjs';
import { handleAdminError } from '../errorHandling.mjs';
import { sendResponse } from '../../../../util/lambdaHelper.mjs';
import { setFields } from '../../../commons/fieldOperations.mjs';

export const handle = async (event) => {

  const roles = event.requestContext.authorizer.claims.profile;
  if (roles !== UserRoles.ADMIN) return sendResponse(HttpResponseCodes.FORBIDDEN);

  const id = event.pathParameters.id;

  const {body: modifiedActivity} = extractBody(event);

  if (!modifiedActivity) return sendResponse(HttpResponseCodes.BAD_REQUEST, {message: 'Missing data'});
  if (modifiedActivity.id !== id) return sendResponse(HttpResponseCodes.BAD_REQUEST, {message: 'Wrong data'});

  try {
    const [foundActivity] = await ActivityRepository.findById(id);
    if (!foundActivity) return sendResponse(HttpResponseCodes.NOT_FOUND);

    setFields(modifiedActivity, foundActivity, 'name', 'levels', 'abilities', 'description');

    const {entity, statement} = ActivityRepository.upsertStatement(foundActivity);

    const [savedActivity] =
        await execOnDatabase({statement: statement, parameters: entity});

    return sendResponse(HttpResponseCodes.OK, ActivityTable.rowToObject(savedActivity));

  } catch (error) {
    return handleAdminError(error);
  }
};