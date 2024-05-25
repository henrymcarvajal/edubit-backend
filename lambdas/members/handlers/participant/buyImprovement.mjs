import { HttpResponseCodes } from '../../../../commons/web/webResponses.mjs';
import { ImprovementRepository } from '../../../../persistence/repositories/improvementRepository.mjs';
import { ParticipantProgressRepository } from '../../../../persistence/repositories/participantProgressRepository.mjs';
import { ValueValidationMessages } from '../../../../commons/messages.mjs';

import { authorizeAndFindParticipant } from './participantAuthorizer.mjs';
import { extractBody } from '../../../../client/aws/utils/bodyExtractor.mjs';
import { handleMembersError } from '../errorHandling.mjs';
import { sendResponse } from '../../../../util/lambdaHelper.mjs';
import { sorter } from '../../../../commons/util/sorter.mjs';
import { validate as uuidValidate } from 'uuid';
import { execOnDatabase } from '../../../../util/dbHelper.mjs';

let ALL_IMPROVEMENTS;

export const handle = async (event) => {

  if (!ALL_IMPROVEMENTS) {
    ALL_IMPROVEMENTS = await ImprovementRepository.findAll();
  }

  const { body } = extractBody(event);

  const participantId = event.pathParameters.id;
  const workshopExecutionId = event.pathParameters.workshopExecutionId;
  const improvementIds = body.improvementIds;

  if (!uuidValidate(participantId)) return sendResponse(HttpResponseCodes.BAD_REQUEST, { message: `${ ValueValidationMessages.VALUE_IS_NOT_UUID }: ${ participantId }` });
  if (!uuidValidate(workshopExecutionId)) return sendResponse(HttpResponseCodes.BAD_REQUEST, { message: `${ ValueValidationMessages.VALUE_IS_NOT_UUID }: ${ workshopExecutionId }` });

  const { profile: roles, email } = event.requestContext.authorizer.claims;

  try {
    const { response } = await authorizeAndFindParticipant(roles, participantId, email);
    if (response) return response;

    const [progress] = await ParticipantProgressRepository.findByParticipantIdAndWorkshopExecutionId(participantId, workshopExecutionId);
    if (!progress) return sendResponse(HttpResponseCodes.NOT_FOUND, { message: `Participant progress not found: ${ participantId }, ${ workshopExecutionId }` });

    const foundImprovements = await ImprovementRepository.findByIdIn(improvementIds);
    if (!foundImprovements.length) return sendResponse(HttpResponseCodes.NOT_FOUND, { message: `Improvements not found: ${ improvementIds }` });
    if (foundImprovements.length !== improvementIds.length) return sendResponse(HttpResponseCodes.BAD_REQUEST, { message: `Invalid improvement ids` });

    if (!containsSubarray(ALL_IMPROVEMENTS.map(a => a.id), foundImprovements.map(f => f.id))) {
      return sendResponse(HttpResponseCodes.BAD_REQUEST, { message: 'Improper buying order. Should be 1, 2, 3.' });
    }

    if (progress.details.improvements) {
      const itemsAlreadyBought = intersect(progress.details.improvements, foundImprovements.map(i => i.id));
      if (itemsAlreadyBought.length) {
        return sendResponse(HttpResponseCodes.BAD_REQUEST, { message: `Improvement already bought: ${ itemsAlreadyBought }` });
      }
    }

    const totalCost = foundImprovements.reduce((accumulator, improvement) => accumulator + improvement.price, 0);

    if (totalCost < progress.details.stats.balance) {
      updateProgress(progress, foundImprovements)
      /*if (!progress.details.improvements) {
        progress.details.improvements = [];
      }
      foundImprovements.forEach(foundImprovement => {
        progress.details.improvements.push(foundImprovement.id);
      });

      progress.details.stats.balance -= totalCost;
      if (!progress.details.stats.currentImprovementRate) {
        progress.details.stats.currentImprovementRate = 0.0;
      }
      progress.details.stats.currentImprovementRate += foundImprovements.reduce((accumulator, improvement) => accumulator + improvement.rate, 0.0);*/

      const { entity, statement } = ParticipantProgressRepository.upsertStatement(progress);
      const [savedProgress] =
          await execOnDatabase({ statement: statement, parameters: entity });

      return sendResponse(HttpResponseCodes.OK, savedProgress);
    } else {
      return sendResponse(HttpResponseCodes.BAD_REQUEST, { message: 'Not enough funds!' });
    }

  } catch (error) {
    return handleMembersError(error);
  }
};

const containsSubarray = (a, b) => {
  return (a.toString()).indexOf(b.toString()) > -1;
};

const intersect = (a, b) => {
  return a.filter(i => b.includes(i));
};

const sortBy = (array, prop) => {
  return array.sort((a, b) => {
    return sorter(a, b, prop);
  });
};

const updateProgress = (progress, foundImprovements) => {
  if (!progress.details.improvements) {
    progress.details.improvements = [];
  }
  foundImprovements.forEach(foundImprovement => {
    progress.details.improvements.push(foundImprovement.id);
  });

  progress.details.stats.balance -= totalCost;
  if (!progress.details.stats.currentImprovementRate) {
    progress.details.stats.currentImprovementRate = 0.0;
  }
  progress.details.stats.currentImprovementRate += foundImprovements.reduce((accumulator, improvement) => accumulator + improvement.rate, 0.0);
}