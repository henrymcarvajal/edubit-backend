import { HttpResponseCodes } from '../../../../commons/web/webResponses.mjs';
import WorkshopExecutionRepository from '../../../../persistence/repositories/workshopExecutionRepository.mjs';
import { ValueValidationMessages } from '../../../../commons/messages.mjs';

import { handleErrorResponse } from '../../../commons/errorHandling.mjs';
import { sendResponse } from '../../../../util/responseHelper.mjs';
import { validate as uuidValidate } from 'uuid';

import { InvalidInputError } from '../../../commons/errors/data/input.mjs';
import { ResourceNotFoundError } from '../../../commons/errors/integrity/resources.mjs';

exports.handle = async (event) => {
  try {
    const workshopExecutionId = validateAndExtractParams(event);
    const foundWorkshopExecution = await fetchWorkshopExecution(workshopExecutionId);
    return sendResponse(HttpResponseCodes.OK, foundWorkshopExecution);
  } catch (error) {
    return handleErrorResponse(error);
  }
};

const validateAndExtractParams = (event) => {
  const { id: workshopExecutionId } = event.pathParameters;
  if (!uuidValidate(workshopExecutionId)) {
    throw new InvalidInputError(`${ ValueValidationMessages.VALUE_IS_NOT_UUID }: ${ workshopExecutionId }`);
  }
  return workshopExecutionId;
};

const fetchWorkshopExecution = async (workshopExecutionId) => {
  const [workshopExecution] = await WorkshopExecutionRepository.findById(workshopExecutionId);
  if (!workshopExecution) {
    throw new ResourceNotFoundError(`Workshop execution not found: ${ workshopExecutionId }`);
  }
  return workshopExecution;
};