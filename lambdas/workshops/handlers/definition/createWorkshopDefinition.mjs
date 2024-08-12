import WorkshopDefinitionRepository from '../../../../persistence/repositories/workshopDefinitionRepository.mjs';
import WorkshopDefinitionTable from '../../../../persistence/tables/workshopDefinitionTable.mjs';
import { HttpResponseCodes } from '../../../../commons/web/webResponses.mjs';

import { authorizeAdmin } from '../../../members/authorizers/adminAuthorizer.mjs';
import { execOnDatabase } from '../../../../util/dbHelper.mjs';
import { extractBody } from '../../../../client/aws/utils/bodyExtractor.mjs';
import { handleErrorResponse } from '../../../commons/errorHandling.mjs';
import { sendResponse } from '../../../../util/responseHelper.mjs';
import { validateWorkshopDefinitionData } from '../../validations/validateWorkshopDefinitionData.mjs';

import { InvalidInputError } from '../../../commons/errors/data/input.mjs';

exports.handle = async (event) => {
  try {
    authorizeAdmin(event);

    const workshopDefinition = validateAndExtractParams(event);
    validateWorkshopDefinitionData(
        workshopDefinition,
        ['name', 'schedule']
    );

    const savedWorkshopDefinition = await saveWorkshopDefinition(workshopDefinition);

    return sendResponse(HttpResponseCodes.OK, savedWorkshopDefinition);
  } catch (error) {
    return handleErrorResponse(error);
  }
};

const validateAndExtractParams = (event) => {
  const { body: workshopDefinition } = extractBody(event);
  if (!workshopDefinition) {
    throw new InvalidInputError(`Missing workshop definition data`);
  }
  return workshopDefinition;
};

const saveWorkshopDefinition = async (workshopDefinition) => {
  const { statement, entity } = WorkshopDefinitionRepository.insertStatement(workshopDefinition);
  const [savedWorkshopDefinition] =
      await execOnDatabase({ statement: statement, parameters: entity });
  return WorkshopDefinitionTable.rowToObject(savedWorkshopDefinition);
};