import { DatabaseErrorType } from '../../../commons/database/handler/errorMapper.mjs';
import { HttpResponseCodes } from '../../../../commons/web/webResponses.mjs';
import { ValueValidationMessages } from '../../../../commons/messages.mjs';
import { WorkshopDefinitionRepository } from '../../../../persistence/repositories/workshopDefinitionRepository.mjs';
import { WorkshopExecutionRepository } from '../../../../persistence/repositories/workshopExecutionRepository.mjs';

import { extractBody } from '../../../../client/aws/utils/bodyExtractor.mjs';
import { validate as uuidValidate } from 'uuid';
import { sendResponse } from '../../../../util/responseHelper.mjs';
import { execOnDatabase } from '../../../../util/dbHelper.mjs';

import { MissingPropertyError } from '../../../../util/error.mjs';

const range = (number, array, property) => {
  console.log(number);
  let lower = 0;
  let upper = 0;

  for (let i = 0; i <= array.length - 1; i++) {
    lower = upper;
    upper += parseInt(array[i][property]);
    if (lower <= number && number < upper) return array[i];
  }

  return {
    description: 'No hay evento'
  };
};

const sorter = (a, b) => {
  if (a.order < b.order) {
    return -1;
  }
  if (a.order > b.order) {
    return 1;
  }
  return 0;
};

export const handle = async (event) => {

  const id = event.pathParameters.id;
  if (!uuidValidate(id)) return sendResponse(HttpResponseCodes.BAD_REQUEST, {message: `${ValueValidationMessages.VALUE_IS_NOT_UUID}: ${id}`});
  const {body} = extractBody(event);

  if (!body) return sendResponse(204, null);

  try {

    const [workshop] = await WorkshopDefinitionRepository.findById(id);

    const workshopConfig = await WorkshopExecutionRepository.findAll();

    workshopConfig.sort(sorter);

    let totalTime = workshopConfig.reduce((n, {duration}) => n + parseInt(duration), 0);
    let currentTime = totalTime - body.remainingTime;
    let currentStage = range(currentTime, workshopConfig, 'duration');

    if (!workshop) {
      return sendResponse(HttpResponseCodes.NOT_FOUND);
    }

    workshop.remainingTime = body.remainingTime;

    const {entity, statement} = WorkshopDefinitionRepository.upsertStatement(workshop);

    const [savedWorkshop] =
        await execOnDatabase({statement: statement, parameters: entity});

    let result = {
      currentActivity: currentStage.description
    };

    result = Object.assign(result, savedWorkshop);

    return sendResponse(HttpResponseCodes.OK, result);

  } catch (error) {
    if (error) console.error(error);

    if (error.type === DatabaseErrorType[DatabaseErrorType.INTEGRITY_CONSTRAINT_VIOLATION]) {
      return sendResponse(HttpResponseCodes.BAD_REQUEST, error);
    }

    if (error instanceof MissingPropertyError) {
      return sendResponse(HttpResponseCodes.BAD_REQUEST, {message: error.message});
    }

    return sendResponse(HttpResponseCodes.INTERNAL_SERVER_ERROR, error, true);
  }
};