import { HttpResponseCodes } from '../../../../commons/web/webResponses.mjs';
import { ValueValidationMessages } from '../../../../commons/messages.mjs';
import { WorkshopDefinitionRepository } from '../../../../persistence/repositories/workshopDefinitionRepository.mjs';

import { handleErrorResponse } from '../../../commons/errorHandling.mjs';
import { sendResponse } from '../../../../util/responseHelper.mjs';
import { validate as uuidValidate } from 'uuid';

import { InvalidInputError } from '../../../commons/errors/data/input.mjs';
import { ResourceNotFoundError } from '../../../commons/errors/integrity/resources.mjs';

export const handle = async (event) => {
  try {
    const { workshopDefinitionId } = validateAndExtractParams(event);
    const foundWorkshopDefinition = await fetchWorkshopDefinition(workshopDefinitionId);
    return sendResponse(HttpResponseCodes.OK, foundWorkshopDefinition);
  } catch (error) {
    return handleErrorResponse(error);
  }
};

const validateAndExtractParams = (event) => {
  const { id: workshopDefinitionId } = event.pathParameters;
  if (!uuidValidate(workshopDefinitionId)) {
    throw new InvalidInputError(`${ ValueValidationMessages.VALUE_IS_NOT_UUID }: ${ workshopDefinitionId }`);
  }
  return { workshopDefinitionId };
};

const fetchWorkshopDefinition = async (workshopDefinitionId) => {
  const [foundWorkshopDefinition] = await WorkshopDefinitionRepository.findById(workshopDefinitionId);
  if (!foundWorkshopDefinition) {
    throw new ResourceNotFoundError(`Workshop definition not found: ${ workshopDefinitionId }`);
  }
  return foundWorkshopDefinition;
};