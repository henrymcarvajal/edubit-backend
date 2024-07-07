import { HttpResponseCodes } from '../../../../commons/web/webResponses.mjs';
import { ValueValidationMessages } from '../../../../commons/messages.mjs';
import { WorkshopDefinitionRepository } from '../../../../persistence/repositories/workshopDefinitionRepository.mjs';
import { WorkshopExecutionRepository } from '../../../../persistence/repositories/workshopExecutionRepository.mjs';

import { extractBody } from '../../../../client/aws/utils/bodyExtractor.mjs';
import { calculateTiming } from '../execution/calculateWorkshopTiming.mjs';
import { handleErrorResponse } from '../../../commons/errorHandling.mjs';
import { sendResponse } from '../../../../util/responseHelper.mjs';
import { validate as uuidValidate } from 'uuid';

import { Engine } from 'json-rules-engine';
import { InvalidInputError } from '../../../commons/errors/data/input.mjs';

let engineTable;

export const handle = async (event) => {
  try {
    const { workshopExecutionId, operationName } = validateAndExtractParams(event);

    await initializeEngine(workshopExecutionId);

    const engine = engineTable[workshopExecutionId].engine;

    const currentWorkshopPhaseType = await getCurrentWorkshopPhaseType(workshopExecutionId);

    const authorize = await runEngine(engine, {
      workshopPhaseType: currentWorkshopPhaseType,
      operationName: operationName
    });

    return sendResponse(HttpResponseCodes.OK, authorize);
  } catch (error) {
    return handleErrorResponse(error);
  }
};

const validateAndExtractParams = (event) => {

  const { body } = extractBody(event);

  const workshopExecutionId = body.workshopExecutionId;
  if (!uuidValidate(workshopExecutionId)) {
    throw new InvalidInputError(`${ ValueValidationMessages.VALUE_IS_NOT_UUID }: ${ workshopExecutionId }`);
  }

  const operationName = body.operationName;

  return { workshopExecutionId, operationName };
};

const initializeEngine = async (workshopExecutionId) => {
  if (!engineTable) engineTable = {};

  if (!engineTable[workshopExecutionId]) {
    const [workshopDefinition] = await WorkshopDefinitionRepository.findByWorkshopExecutionId(workshopExecutionId);
    engineTable[workshopExecutionId] = { workshopDefinition: workshopDefinition, engine: new Engine() };
    engineTable[workshopExecutionId].engine.addRule(workshopDefinition.authorizer);
  }
};

const getCurrentWorkshopPhaseType = async (workshopExecutionId) => {
  const [workshopExecution] = await WorkshopExecutionRepository.findScheduleById(workshopExecutionId);
  const timing = calculateTiming(workshopExecution);
  return timing.currentPhase.type;
};

const runEngine = async (engine, facts) => {
  console.log('facts', facts);
  let result = false;
  const { events } = await engine.run(facts);
  events.map(event => result = event.params.authorize);
  return { authorize: result };
};