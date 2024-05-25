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

    if (!contains(ALL_IMPROVEMENTS, foundImprovements)) {
      return sendResponse(HttpResponseCodes.BAD_REQUEST, { message: 'Improper buying order. Should be 1, 2, 3.' });
    }

    let foundCodes = foundImprovements
        .sort((a, b) => {
          return sorter(a, b, 'code');
        })

    if (progress.details.improvements) {
      const boughtCodes = progress.details.improvements
          .sort((a, b) => {
            return sorter(a, b, 'code');
          });

      const itemsBought = intersect(boughtCodes, foundCodes);
      if (itemsBought.length) {
        return sendResponse(HttpResponseCodes.BAD_REQUEST, { message: `Improvement already bought: ${itemsBought}` });
      }
    }

    const totalCost = foundImprovements.reduce((accumulator, improvement) => accumulator + improvement.price, 0);

    if (totalCost < progress.details.stats.balance) {
      return sendResponse(HttpResponseCodes.OK, { message: 'Items bought!' });
    } else {
      return sendResponse(HttpResponseCodes.BAD_REQUEST, { message: 'Not enough funds!' });
    }

  } catch (error) {
    return handleMembersError(error);
  }
};

const contains = (a, b) => {
  return (a.map(i => i.code).toString()).indexOf(b.map(i => i.code).toString()) > -1;
}

const intersect = (a, b) => {
  return a.map(i => i.code).filter(i => b.map(i => i.code).includes(i));
}