import { HttpResponseCodes } from '../../../../commons/web/webResponses.mjs';
import { ImprovementRepository } from '../../../../persistence/repositories/improvementRepository.mjs';
import { ParticipantProgressRepository } from '../../../../persistence/repositories/participantProgressRepository.mjs';
import { ValueValidationMessages } from '../../../../commons/messages.mjs';

import { authorizeAndFindParticipant } from './participantAuthorizer.mjs';
import { extractBody } from '../../../../client/aws/utils/bodyExtractor.mjs';
import { handleMembersError } from '../errorHandling.mjs';
import { sendResponse } from '../../../../util/lambdaHelper.mjs';
import { validate as uuidValidate } from 'uuid';
import { execOnDatabase } from '../../../../util/dbHelper.mjs';

let ALL_IMPROVEMENTS;

export const handle = async (event) => {

    if (!ALL_IMPROVEMENTS) {
        ALL_IMPROVEMENTS = (await ImprovementRepository.findAll()).map(i => toView(i));
    }

    const { body } = extractBody(event);

    const participantId = event.pathParameters.id;
    const workshopExecutionId = event.pathParameters.workshopExecutionId;
    const improvementIds = body.improvementIds;

    if (!uuidValidate(participantId)) return sendResponse(HttpResponseCodes.BAD_REQUEST, { message: `${ValueValidationMessages.VALUE_IS_NOT_UUID}: ${participantId}` });
    if (!uuidValidate(workshopExecutionId)) return sendResponse(HttpResponseCodes.BAD_REQUEST, { message: `${ValueValidationMessages.VALUE_IS_NOT_UUID}: ${workshopExecutionId}` });

    const { profile: roles, email } = event.requestContext.authorizer.claims;

    try {
        const { response } = await authorizeAndFindParticipant(roles, participantId, email);
        if (response) return response;

        const [progress] = await ParticipantProgressRepository.findByParticipantIdAndWorkshopExecutionId(participantId, workshopExecutionId);
        if (!progress)
            return sendResponse(HttpResponseCodes.NOT_FOUND, { message: `Participant progress not found: ${participantId}, ${workshopExecutionId}` });

        const requestedImprovements = await ImprovementRepository.findByIdIn(improvementIds);
        if (!requestedImprovements.length)
            return sendResponse(HttpResponseCodes.NOT_FOUND, { message: `Improvements not found: ${improvementIds}` });
        if (requestedImprovements.length !== improvementIds.length)
            return sendResponse(HttpResponseCodes.BAD_REQUEST, { message: `Invalid improvement ids` });

        const subarrayIsContained = containsSubarray(ALL_IMPROVEMENTS.map(a => a.id), requestedImprovements.map(f => f.id));
        if (!subarrayIsContained) {
            return sendResponse(HttpResponseCodes.BAD_REQUEST, { message: `Improper buying order. Should be 1, 2, 3.` });
        }

        const ownedImprovements = progress.details.improvements ? progress.details.improvements : [];
        const itemsAlreadyBought = intersect(ownedImprovements.map(i => i.id), requestedImprovements.map(i => i.id));
        if (itemsAlreadyBought.length) {
            return sendResponse(HttpResponseCodes.BAD_REQUEST, { message: `Improvement already bought: ${itemsAlreadyBought}` });
        }

        const prerequisitesAreMet = prerequisitesMet(requestedImprovements[0], [requestedImprovements, ownedImprovements]);
        if (!prerequisitesAreMet) {
            return sendResponse(HttpResponseCodes.BAD_REQUEST, { message: `Requisites not met` });
        }

        const totalCost = requestedImprovements.reduce((accumulator, improvement) => accumulator + improvement.price, 0);
        if (totalCost <= progress.details.stats.balance) {
            updateProgress(progress, requestedImprovements, totalCost);

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

const updateProgress = (progress, foundImprovements, totalCost) => {
    if (!progress.details.improvements) {
        progress.details.improvements = [];
    }
    foundImprovements.forEach(foundImprovement => {
        const improvementView = toView(foundImprovement);
        progress.details.improvements.push(improvementView);
    });

    progress.details.stats.balance -= totalCost;
    if (!progress.details.stats.currentImprovementRate) {
        progress.details.stats.currentImprovementRate = 0.0;
    }
    progress.details.stats.currentImprovementRate += foundImprovements.reduce((accumulator, improvement) => accumulator + improvement.rate, 0.0);
};

const prerequisitesMet = (item, arrays) => {

    // Check if item has no prerequisites
    if (!item.prerequisite) return true;

    // Check if arrays is empty
    if (!arrays.length) return false;

    // Make a copy of arrays to avoid mutation
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

const toView = (foundImprovement) => {
    return {
        id: foundImprovement.id,
        price: foundImprovement.price,
        code: foundImprovement.code,
        rate: foundImprovement.rate,
        prerequisite: foundImprovement.prerequisite
    };
};
