import { ActivityRepository } from '../../../../persistence/repositories/activityRepository.mjs';
import { ActivityTable } from '../../../../persistence/tables/activityTable.mjs';
import { HttpResponseCodes } from '../../../../commons/web/webResponses.mjs';
import { UserRoles } from '../../../users/handlers/enrollment/constants.mjs';

import { checkProps } from '../../../../util/propsGetter.mjs';
import { extractBody } from '../../../../client/aws/utils/bodyExtractor.mjs';
import { execOnDatabase } from '../../../../util/dbHelper.mjs';
import { handleAdminError } from '../errorHandling.mjs';
import { sendResponse } from '../../../../util/lambdaHelper.mjs';

export const handle = async (event) => {

  const roles = event.requestContext.authorizer.claims.profile;
  if (roles !== UserRoles.ADMIN) return sendResponse(HttpResponseCodes.FORBIDDEN);

  const {body: newActivity} = extractBody(event);
  if (!newActivity) return sendResponse(HttpResponseCodes.BAD_REQUEST, {message: 'Missing data'});

  try {

    const props = ['name', 'levels', 'abilities', 'description'];
    checkProps(newActivity, props);

    const {entity, statement} = ActivityRepository.insertStatement(newActivity);

    const [savedActivity] =
        await execOnDatabase({statement: statement, parameters: entity});

    return sendResponse(HttpResponseCodes.OK, ActivityTable.rowToObject(savedActivity));

  } catch (error) {
    return handleAdminError(error);
  }
};