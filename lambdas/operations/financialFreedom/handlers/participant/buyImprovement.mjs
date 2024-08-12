import ImprovementRepository from '../../../../../persistence/repositories/improvementRepository.mjs';
import ParticipantProgressRepository from '../../../../../persistence/repositories/participantProgressRepository.mjs';
import { AwsInfo } from '../../../../../client/aws/AwsInfo.mjs';
import { HttpResponseCodes } from '../../../../../commons/web/webResponses.mjs';
import { ValueValidationMessages } from '../../../../../commons/messages.mjs';
import { WORKSHOP_OPERATION_NAMES } from '../../definitions/operations.mjs';

import { authorizeAndFindParticipant } from '../../../../members/authorizers/participantAuthorizer.mjs';
import { execOnDatabase } from '../../../../../util/dbHelper.mjs';
import { extractBody } from '../../../../../client/aws/utils/bodyExtractor.mjs';
import { getAuthorizationResult } from '../../commons/getAuthorizationResult.mjs';
import { getParticipantProgress } from '../../commons/getParticipantProgress.mjs';
import { handleErrorResponse } from '../../../../commons/errorHandling.mjs';
import { invokeLambda } from '../../../../../client/aws/clients/lambdaClient.mjs';
import { messageQueue } from '../../../../../client/aws/clients/sqsClient.mjs';
import { sendResponse } from '../../../../../util/responseHelper.mjs';

import { ForbiddenOperationError } from '../../../../commons/errors/security/restrictedAccess.mjs';
import { InvalidInputError } from '../../../../commons/errors/data/input.mjs';
import { ResourceNotFoundError, ResourceStateError } from '../../../../commons/errors/integrity/resources.mjs';
import { validate as uuidValidate } from 'uuid';

let ALL_IMPROVEMENTS;

exports.handle = async (event) => {

  try {
    await initializeImprovements();

    const { participantId, workshopExecutionId, improvementIds } = validateAndExtractParams(event);

    const participant = await authorizeAndFindParticipant(event, participantId);

    await authorizeOperation(workshopExecutionId, participantId);

    const progress = await getParticipantProgress(participantId, workshopExecutionId);

    await validateImprovementIds(improvementIds);

    const requestedImprovements = await ImprovementRepository.findByIdIn(improvementIds);
    validateRequestedImprovements(improvementIds, requestedImprovements);

    validateImprovementOrder(requestedImprovements);
    validateImprovementsNotAlreadyBought(progress, requestedImprovements);
    validatePrerequisites(requestedImprovements, progress);

    const [savedProgress] = await processImprovements(progress, requestedImprovements);

    await notifyEvent(workshopExecutionId, participant, requestedImprovements);

    return sendResponse(HttpResponseCodes.OK, savedProgress);
  } catch (error) {
    return handleErrorResponse(error);
  }
};

const authorizeOperation = async (workshopExecutionId, participantId) => {
  const operation = WORKSHOP_OPERATION_NAMES.PARTICIPANT_BUY_IMPROVEMENT;
  const result = await invokeLambda(
      AwsInfo.WORKSHOPS_OPERATIONS_AUTHORIZER,
      {
        operationName: operation,
        participantId: participantId,
        workshopExecutionId: workshopExecutionId
      });

  const authorize = getAuthorizationResult(result);
  if (!authorize) {
    throw new ForbiddenOperationError(`Operation ${ operation } cannot be performed at this moment`);
  }
};

const initializeImprovements = async () => {
  if (!ALL_IMPROVEMENTS) {
    ALL_IMPROVEMENTS = (await ImprovementRepository.findAll()).map(toView);
  }
};

const validateAndExtractParams = (event) => {
  const participantId = event.pathParameters.participantId;
  if (!uuidValidate(participantId)) {
    throw new InvalidInputError(`${ ValueValidationMessages.VALUE_IS_NOT_UUID } (participantId)}: ${ participantId }`);
  }

  const workshopExecutionId = event.pathParameters.workshopExecutionId;
  if (!uuidValidate(workshopExecutionId)) {
    throw new InvalidInputError(`${ ValueValidationMessages.VALUE_IS_NOT_UUID } (workshopExecutionId): ${ workshopExecutionId }`);
  }

  const { body: {improvementIds} } = extractBody(event);
  return { participantId, workshopExecutionId, improvementIds };
};

const validateImprovementIds = async (improvementIds) => {
  const improvements = await ImprovementRepository.findByIdIn(improvementIds);
  if (!improvements.length || improvements.length !== improvementIds.length) {
    throw new InvalidInputError(`Invalid improvement ids`);
  }
};

const validateRequestedImprovements = (improvementIds, requestedImprovements) => {
  if (requestedImprovements.length !== improvementIds.length) {
    throw new ResourceNotFoundError(`Improvements not found: ${ improvementIds }`);
  }
};

const validateImprovementOrder = (requestedImprovements) => {
  const subarrayIsContained = containsSubarray(ALL_IMPROVEMENTS.map(a => a.id), requestedImprovements.map(f => f.id));
  if (!subarrayIsContained) {
    throw new InvalidInputError(`Improper buying order. Must be 1, 2, 3.`);
  }
};

const validateImprovementsNotAlreadyBought = (progress, requestedImprovements) => {
  const ownedImprovements = progress.details.improvements || [];
  const itemsAlreadyBought = intersect(ownedImprovements.map(i => i.id), requestedImprovements.map(i => i.id));
  if (itemsAlreadyBought.length) {
    throw new ResourceStateError(`Improvement already bought: ${ itemsAlreadyBought }`);
  }
};

const validatePrerequisites = (requestedImprovements, progress) => {
  if (!prerequisitesMet(requestedImprovements[0], [requestedImprovements, progress.details.improvements || []])) {
    throw new ResourceStateError(`Requisites not met`);
  }
};

const processImprovements = async (progress, requestedImprovements) => {
  const totalCost = requestedImprovements.reduce((acc, improvement) => acc + improvement.price, 0);
  if (totalCost > progress.details.stats.balance) {
    throw new ResourceStateError('Not enough funds!');
  }

  updateProgress(progress, requestedImprovements, totalCost);

  const { entity, statement } = ParticipantProgressRepository.upsertStatement(progress);
  return await execOnDatabase({ statement, parameters: entity });
};

const containsSubarray = (a, b) => a.toString().indexOf(b.toString()) > -1;
const intersect = (a, b) => a.filter(i => b.includes(i));

const updateProgress = (progress, foundImprovements, totalCost) => {
  progress.details.improvements = progress.details.improvements || [];
  foundImprovements.forEach(improvement => {
    progress.details.improvements.push(toView(improvement));
  });

  progress.details.stats.balance -= totalCost;
  progress.details.stats.currentImprovementRate = (progress.details.stats.currentImprovementRate || 0) +
      foundImprovements.reduce((acc, improvement) => acc + improvement.rate, 0);
};

const prerequisitesMet = (item, arrays) => {
  if (!item.prerequisite) return true;
  if (!arrays.length) return false;

  let arraysCopy = [...arrays];

  while (arraysCopy.length) {
    let currentArray = arraysCopy[0];

    if (currentArray.length) {
      const nextItem = currentArray.find(i => i.code === item.prerequisite);
      currentArray = currentArray.filter(i => i.code !== item.code);
      arraysCopy[0] = currentArray;

      if (nextItem) {
        return prerequisitesMet(nextItem, arraysCopy);
      } else {
        if (!currentArray.length) {
          arraysCopy.shift();
        } else {
          return false;
        }
      }
    } else {
      arraysCopy.shift();
    }
  }

  return false;
};

const toView = (foundImprovement) => ({
  id: foundImprovement.id,
  price: foundImprovement.price,
  code: foundImprovement.code,
  rate: foundImprovement.rate,
  prerequisite: foundImprovement.prerequisite
});

const notifyEvent = async (workshopExecutionId, participant, requestedImprovements) => {
  const participantName = participant.name;
  const improvementNames = requestedImprovements.map(i => i.name);
  await messageQueue(AwsInfo.EVENT_REGISTRY_QUEUE, {
    workshopExecutionId,
    participantName,
    operationName: WORKSHOP_OPERATION_NAMES.PARTICIPANT_BUY_IMPROVEMENT,
    improvementNames
  });
};