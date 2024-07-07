import { HttpResponseCodes } from '../../../../commons/web/webResponses.mjs';
import { ValueValidationMessages } from '../../../../commons/messages.mjs';
import { WorkshopExecutionRepository } from '../../../../persistence/repositories/workshopExecutionRepository.mjs';
import { WorkshopExecutionTable } from '../../../../persistence/tables/workshopExecutionModel.mjs';

import { authorizeAdmin } from '../../../members/authorizers/adminAuthorizer.mjs';
import { extractBody } from '../../../../client/aws/utils/bodyExtractor.mjs';
import { execOnDatabase } from '../../../../util/dbHelper.mjs';
import { handleErrorResponse } from '../../../commons/errorHandling.mjs';
import { sendResponse } from '../../../../util/responseHelper.mjs';
import { setFields } from '../../../commons/fieldOperations.mjs';
import { validate as uuidValidate } from 'uuid';
import { validateWorkshopExecutionData } from '../../validations/validateWorkshopExecutionData.mjs';

import { InvalidInputError } from '../../../commons/errors/data/input.mjs';
import { ResourceNotFoundError, ResourceStateError } from '../../../commons/errors/integrity/resources.mjs';

export const handle = async (event) => {

  try {
    authorizeAdmin(event);

    const { workshopExecutionId, modifiedWorkshopExecution } = validateAndExtractParams(event);
    await validateWorkshopExecutionData(
        modifiedWorkshopExecution,
        ['scheduledDate', 'activities']
    );

    const foundWorkshopExecution = await fetchWorkshopExecution(workshopExecutionId);
    updateWorkshopExecution(foundWorkshopExecution, modifiedWorkshopExecution);
    const savedWorkshopExecution = await saveWorkshopExecution(foundWorkshopExecution);

    return sendResponse(HttpResponseCodes.OK, savedWorkshopExecution);
  } catch (error) {
    return handleErrorResponse(error);
  }
};

const validateAndExtractParams = (event) => {
  const { id: workshopExecutionId } = event.pathParameters;
  if (!uuidValidate(workshopExecutionId)) {
    throw new InvalidInputError(`${ ValueValidationMessages.VALUE_IS_NOT_UUID }: ${ workshopExecutionId }`);
  }

  const { body: modifiedWorkshopExecution } = extractBody(event);
  if (!modifiedWorkshopExecution) {
    throw new InvalidInputError('Missing workshop execution data');
  }
  if (modifiedWorkshopExecution.id !== workshopExecutionId) {
    throw new InvalidInputError('Ids do not match');
  }

  return { workshopExecutionId, modifiedWorkshopExecution };
};

const fetchWorkshopExecution = async (workshopExecutionId) => {
  const [foundWorkshopExecution] = await WorkshopExecutionRepository.findById(workshopExecutionId);
  if (!foundWorkshopExecution) {
    throw new ResourceNotFoundError(`Workshop execution not found: ${ workshopExecutionId }`);
  }
  return foundWorkshopExecution;
};

const updateWorkshopExecution = (foundWorkshopExecution, modifiedWorkshopExecution) => {
  if (!foundWorkshopExecution.startTimestamp) {
    setFields(modifiedWorkshopExecution, foundWorkshopExecution, 'scheduledDate', 'institutionId', 'workshopDefinitionId', 'activities');
  } else {
    throw new ResourceStateError('Workshop execution cannot be modified at this moment');
  }
};

const saveWorkshopExecution = async (workshopExecution) => {
  const { entity, statement } = WorkshopExecutionRepository.upsertStatement(workshopExecution);
  const [savedWorkshop] =
      await execOnDatabase({ statement: statement, parameters: entity });
  return WorkshopExecutionTable.rowToObject(savedWorkshop);
};