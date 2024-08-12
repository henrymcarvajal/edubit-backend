import WorkshopDefinitionRepository from '../../../../persistence/repositories/workshopDefinitionRepository.mjs';
import WorkshopDefinitionTable from '../../../../persistence/tables/workshopDefinitionTable.mjs';
import { HttpResponseCodes } from '../../../../commons/web/webResponses.mjs';
import { ValueValidationMessages } from '../../../../commons/messages.mjs';

import { authorizeAdmin } from '../../../members/authorizers/adminAuthorizer.mjs';
import { extractBody } from '../../../../client/aws/utils/bodyExtractor.mjs';
import { execOnDatabase } from '../../../../util/dbHelper.mjs';
import { handleErrorResponse } from '../../../commons/errorHandling.mjs';
import { sendResponse } from '../../../../util/responseHelper.mjs';
import { validate as uuidValidate } from 'uuid';
import { validateWorkshopDefinitionData } from '../../validations/validateWorkshopDefinitionData.mjs';

import { InvalidInputError } from '../../../commons/errors/data/input.mjs';
import { ResourceNotFoundError } from '../../../commons/errors/integrity/resources.mjs';

exports.handle = async (event) => {
  try {
    authorizeAdmin(event);

    const { workshopDefinitionId, modifiedWorkshopDefinition } = validateAndExtractParams(event);
    validateWorkshopDefinitionData(modifiedWorkshopDefinition, ['name']);

    const foundWorkshopDefinition = await fetchWorkshopDefinition(workshopDefinitionId);
    updateWorkshopDefinition(foundWorkshopDefinition, modifiedWorkshopDefinition);
    const savedWorkshopDefinition = await saveWorkshopDefinition(foundWorkshopDefinition);

    return sendResponse(HttpResponseCodes.OK, savedWorkshopDefinition);
  } catch (error) {
    return handleErrorResponse(error);
  }
};

const validateAndExtractParams = (event) => {
  const { id: workshopDefinitionId } = event.pathParameters;
  if (!uuidValidate(workshopDefinitionId)) {
    throw new InvalidInputError(`${ ValueValidationMessages.VALUE_IS_NOT_UUID }: ${ workshopDefinitionId }`);
  }

  const { body: modifiedWorkshopDefinition } = extractBody(event);
  if (!modifiedWorkshopDefinition) {
    throw new InvalidInputError('Missing workshop definition data');
  }
  if (modifiedWorkshopDefinition.id !== workshopDefinitionId) {
    throw new InvalidInputError('Ids do not match');
  }

  return { workshopDefinitionId, modifiedWorkshopDefinition };
};

const fetchWorkshopDefinition = async (workshopDefinitionId) => {
  const [foundWorkshopDefinition] = await WorkshopDefinitionRepository.findById(workshopDefinitionId);
  if (!foundWorkshopDefinition) {
    throw new ResourceNotFoundError(`Workshop definition not found: ${workshopDefinitionId}`);
  }
  return foundWorkshopDefinition;
};

const updateWorkshopDefinition = (foundWorkshopDefinition, modifiedWorkshopDefinition) => {
  if (foundWorkshopDefinition.name !== modifiedWorkshopDefinition.name) {
    foundWorkshopDefinition.name = modifiedWorkshopDefinition.name;
    foundWorkshopDefinition.modificationDate = new Date();
  }
  if (foundWorkshopDefinition.schedule !== modifiedWorkshopDefinition.schedule) {
    foundWorkshopDefinition.schedule = modifiedWorkshopDefinition.schedule;
    foundWorkshopDefinition.modificationDate = new Date();
  }
  if (foundWorkshopDefinition.enabled !== modifiedWorkshopDefinition.enabled) {
    foundWorkshopDefinition.enabled = modifiedWorkshopDefinition.enabled;
    foundWorkshopDefinition.modificationDate = new Date();
    foundWorkshopDefinition.disabledDate = new Date();
  }
};

const saveWorkshopDefinition = async (workshopDefinition) => {
  const { entity, statement } = WorkshopDefinitionRepository.upsertStatement(workshopDefinition);
  const [savedWorkshop] =
      await execOnDatabase({ statement: statement, parameters: entity });
  return WorkshopDefinitionTable.rowToObject(savedWorkshop);
};