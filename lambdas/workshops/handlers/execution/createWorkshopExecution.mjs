import { HttpResponseCodes } from '../../../../commons/web/webResponses.mjs';
import { WorkshopDefinitionRepository } from '../../../../persistence/repositories/workshopDefinitionRepository.mjs';
import { WorkshopExecutionRepository } from '../../../../persistence/repositories/workshopExecutionRepository.mjs';
import { WorkshopExecutionTable } from '../../../../persistence/tables/workshopExecutionModel.mjs';

import { authorizeAdmin } from '../../../members/authorizers/adminAuthorizer.mjs';
import { execOnDatabase } from '../../../../util/dbHelper.mjs';
import { extractBody } from '../../../../client/aws/utils/bodyExtractor.mjs';
import { handleErrorResponse } from '../../../commons/errorHandling.mjs';
import { sendResponse } from '../../../../util/responseHelper.mjs';
import { validateWorkshopExecutionData } from '../../validations/validateWorkshopExecutionData.mjs';

import { InvalidInputError } from '../../../commons/errors/data/input.mjs';
import { ResourceNotFoundError } from '../../../commons/errors/integrity/resources.mjs';

export const handle = async (event) => {
  try {
    authorizeAdmin(event);

    const workshopExecution = validateAndExtractParams(event);
    await validateWorkshopExecutionData(
        workshopExecution,
        ['scheduledDate', 'institutionId', 'workshopDefinitionId', 'activities']
    );

    const workshopDefinition = await fetchWorkshopDefinition(workshopExecution.workshopDefinitionId);

    updateWorkshopExecution(workshopExecution, workshopDefinition);

    const savedWorkshopExecution = await saveWorkshopExecution(workshopExecution);

    return sendResponse(HttpResponseCodes.CREATED, savedWorkshopExecution);
  } catch (error) {
    return handleErrorResponse(error);
  }
};

const validateAndExtractParams = (event) => {
  const { body: workshopExecution } = extractBody(event);
  if (!workshopExecution) {
    throw new InvalidInputError(`Missing workshop execution data`);
  }
  return workshopExecution;
};

const fetchWorkshopDefinition = async (workshopDefinitionId) => {
  const [workshopDefinition] = await WorkshopDefinitionRepository.findById(workshopDefinitionId);
  if (!workshopDefinition) {
    throw new ResourceNotFoundError(`Workshop Definition not found: ${ workshopDefinitionId }`);
  }
  return workshopDefinition;
};

const getTotalRunningTime = (workshopDefinition) => {
  return Object
      .values(workshopDefinition.schedule)
      .map(r => r.duration)
      .reduce((accumulator, currentValue) => accumulator + currentValue, 0);
};

const updateWorkshopExecution = (workshopExecution, workshopDefinition) => {
  workshopExecution.elapsedTime = 0;
  workshopExecution.remainingTime = getTotalRunningTime(workshopDefinition);
};

const saveWorkshopExecution = async (workshopExecution) => {
  const { statement, entity } = WorkshopExecutionRepository.insertStatement(workshopExecution);
  const [savedWorkshopExecution] =
      await execOnDatabase({ statement: statement, parameters: entity });
  return WorkshopExecutionTable.rowToObject(savedWorkshopExecution);
};

