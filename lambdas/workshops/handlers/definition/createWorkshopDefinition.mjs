import { HttpResponseCodes } from '../../../../commons/web/webResponses.mjs';
import { WorkshopDefinitionRepository } from '../../../../persistence/repositories/workshopDefinitionRepository.mjs';
import { WorkshopDefinitionTable } from '../../../../persistence/tables/workshopDefinitionTable.mjs';

import { authorizeAdmin } from '../../../members/authorizers/adminAuthorizer.mjs';
import { checkProps } from '../../../../util/propsGetter.mjs';
import { execOnDatabase } from '../../../../util/dbHelper.mjs';
import { extractBody } from '../../../../client/aws/utils/bodyExtractor.mjs';
import { sendResponse } from '../../../../util/responseHelper.mjs';
import { handleErrorResponse } from '../../../commons/errorHandling.mjs';

import { InvalidInputError } from '../../../commons/errors/data/input.mjs';

export const handle = async (event) => {
  try {
    authorizeAdmin(event);

    const workshopDefinition = validateAndExtractParams(event);

    validateWorkshopDefinitionData(workshopDefinition);

    const savedWorkshopDefinition = await saveWorkshopDefinition(workshopDefinition);

    return sendResponse(HttpResponseCodes.OK, savedWorkshopDefinition);

  } catch (error) {
    return handleErrorResponse(error);
  }
};

const validateAndExtractParams = (event) => {
  const { body: workshop } = extractBody(event);
  if (!workshop) {
    throw new InvalidInputError(`Missing workshop definition data`);
  }
  return workshop;
};

const validateWorkshopDefinitionData = (workshop) => {
  let props = ['name', 'schedule'];
  checkProps(workshop, props);

  let keys = Object.keys(workshop.schedule);
  if (keys.length === 0) {
    throw new InvalidInputError('Missing activities data');
  }

  let activityProps = ['duration', 'description'];
  keys.forEach((key) => {
    const activity = workshop.schedule[key];
    checkProps(activity, activityProps);
    if (typeof activity.duration !== 'number') {
      throw new InvalidInputError(`duration should be a number: ${ activity.duration }`);
    }
  });
};

const saveWorkshopDefinition = async (workshopDefinition) => {
  const { statement, entity } = WorkshopDefinitionRepository.insertStatement(workshopDefinition);
  const [savedWorkshopDefinition] =
      await execOnDatabase({ statement: statement, parameters: entity });
  return WorkshopDefinitionTable.rowToObject(savedWorkshopDefinition);
};