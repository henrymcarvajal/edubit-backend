import { HttpResponseCodes } from '../../../../commons/web/webResponses.mjs';
import { ImprovementRepository } from '../../../../persistence/repositories/improvementRepository.mjs';
import { ImprovementTable } from '../../../../persistence/tables/improvementTable.mjs';
import { UserRoles } from '../../../users/handlers/enrollment/constants.mjs';

import { execOnDatabase } from '../../../../util/dbHelper.mjs';
import { extractBody } from '../../../../client/aws/utils/bodyExtractor.mjs';
import { handleAdminError } from '../errorHandling.mjs';
import { sendResponse } from '../../../../util/lambdaHelper.mjs';
import { setFields } from '../../../commons/fieldOperations.mjs';

export const handle = async (event) => {

  const roles = event.requestContext.authorizer.claims.profile;
  if (roles !== UserRoles.ADMIN) return sendResponse(HttpResponseCodes.FORBIDDEN);

  const id = event.pathParameters.id;

  const {body: modifiedImprovement} = extractBody(event);

  if (!modifiedImprovement) return sendResponse(HttpResponseCodes.BAD_REQUEST, {message: 'Missing data'});
  if (modifiedImprovement.id !== id) return sendResponse(HttpResponseCodes.BAD_REQUEST, {message: 'Wrong data'});

  try {
    const [foundImprovement] = await ImprovementRepository.findById(id);
    if (!foundImprovement) return sendResponse(HttpResponseCodes.NOT_FOUND);

    setFields(modifiedImprovement, foundImprovement, 'name', 'price', 'description');

    const {entity, statement} = ImprovementRepository.upsertStatement(foundImprovement);

    const [savedImprovement] =
        await execOnDatabase({statement: statement, parameters: entity});

    return sendResponse(HttpResponseCodes.OK, ImprovementTable.rowToObject(savedImprovement));

  } catch (error) {
    return handleAdminError(error);
  }
};