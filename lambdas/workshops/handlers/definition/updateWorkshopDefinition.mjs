import { HttpResponseCodes } from '../../../../commons/web/webResponses.mjs';
import { ValueValidationMessages } from '../../../../commons/messages.mjs';
import { WorkshopDefinitionRepository } from '../../../../persistence/repositories/workshopDefinitionRepository.mjs';
import { WorkshopDefinitionTable } from '../../../../persistence/tables/workshopDefinitionTable.mjs';

import { authorizeAdmin } from '../../../members/authorizers/adminAuthorizer.mjs';
import { extractBody } from '../../../../client/aws/utils/bodyExtractor.mjs';
import { execOnDatabase } from '../../../../util/dbHelper.mjs';
import { handleErrorResponse } from '../../../commons/errorHandling.mjs';
import { sendResponse } from '../../../../util/responseHelper.mjs';
import { validate as uuidValidate } from 'uuid';

import { InvalidInputError } from '../../../commons/errors/data/input.mjs';

export const handle = async (event) => {
  try {
    authorizeAdmin(event);

    const { workshopDefinitionId, modifiedWorkshopDefinition } = validateAndExtractParams(event);

    const foundWorkshopDefinition = await fetchWorkshopDefinition(workshopDefinitionId);

    updateWorkshopDefinition(foundWorkshopDefinition, modifiedWorkshopDefinition);

    const savedWorkshop = await saveWorkshopDefinition(foundWorkshopDefinition);

    return sendResponse(HttpResponseCodes.OK, savedWorkshop);

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
    return sendResponse(HttpResponseCodes.NOT_FOUND, null);
  }
  return foundWorkshopDefinition;
};

const updateWorkshopDefinition = (foundWorkshop, modifiedWorkshop) => {
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
};

const saveWorkshopDefinition = async (workshopDefinition) => {
  const { entity, statement } = WorkshopDefinitionRepository.upsertStatement(workshopDefinition);
  const [savedWorkshop] =
      await execOnDatabase({ statement: statement, parameters: entity });
  return WorkshopDefinitionTable.rowToObject(savedWorkshop);
};