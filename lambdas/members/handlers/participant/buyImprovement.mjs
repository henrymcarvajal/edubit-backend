import { HttpResponseCodes } from '../../../../commons/web/webResponses.mjs';
import { ImprovementRepository } from '../../../../persistence/repositories/improvementRepository.mjs';
import { ParticipantProgressRepository } from '../../../../persistence/repositories/participantProgressRepository.mjs';
import { ValueValidationMessages } from '../../../../commons/messages.mjs';

import { authorizeAndFindParticipant } from './participantAuthorizer.mjs';
import { execOnDatabase } from '../../../../util/dbHelper.mjs';
import { extractBody } from '../../../../client/aws/utils/bodyExtractor.mjs';
import { handleMembersError } from '../errorHandling.mjs';
import { sendResponse } from '../../../../util/lambdaHelper.mjs';
import { validate as uuidValidate } from 'uuid';

import { ImprovementRequestError, InsufficientFundsError, InvalidRequestError } from '../../validations/error.mjs';
import { InvalidUuidError } from '../../../commons/validations/error.mjs';

let ALL_IMPROVEMENTS;

export const handle = async (event) => {
    try {
        await initializeImprovements();
        const { body } = extractBody(event);

        const { participantId, workshopExecutionId, improvementIds } = validateAndExtractParams(event, body);
        const { profile: roles, email } = event.requestContext.authorizer.claims;

        const { response } = await authorizeAndFindParticipant(roles, participantId, email);
        if (response) return response;

        const progress = await getParticipantProgress(participantId, workshopExecutionId);
        await validateImprovementIds(improvementIds);

        const requestedImprovements = await ImprovementRepository.findByIdIn(improvementIds);
        validateRequestedImprovements(improvementIds, requestedImprovements);

        validateImprovementOrder(requestedImprovements);
        validateImprovementsNotAlreadyBought(progress, requestedImprovements);
        validatePrerequisites(requestedImprovements, progress);

        return await processImprovements(progress, requestedImprovements);

    } catch (error) {
        return handleMembersError(error);
    }
};

const initializeImprovements = async () => {
    if (!ALL_IMPROVEMENTS) {
        ALL_IMPROVEMENTS = (await ImprovementRepository.findAll()).map(toView);
    }
};

const validateAndExtractParams = (event, body) => {
    const participantId = event.pathParameters.id;
    const workshopExecutionId = event.pathParameters.workshopExecutionId;
    const improvementIds = body.improvementIds;

    if (!uuidValidate(participantId)) {
        throw new InvalidUuidError(`${ValueValidationMessages.VALUE_IS_NOT_UUID}: ${participantId}`);
    }

    if (!uuidValidate(workshopExecutionId)) {
        throw new InvalidUuidError(`${ValueValidationMessages.VALUE_IS_NOT_UUID}: ${workshopExecutionId}`);
    }

    return { participantId, workshopExecutionId, improvementIds };
};

const getParticipantProgress = async (participantId, workshopExecutionId) => {
    const [progress] = await ParticipantProgressRepository.findByParticipantIdAndWorkshopExecutionId(participantId, workshopExecutionId);
    if (!progress) {
        throw new InvalidRequestError(`Participant progress not found: ${participantId}, ${workshopExecutionId}`);
    }
    return progress;
};

const validateImprovementIds = async (improvementIds) => {
    const improvements = await ImprovementRepository.findByIdIn(improvementIds);
    if (!improvements.length || improvements.length !== improvementIds.length) {
        throw new ImprovementRequestError(`Invalid improvement ids`);
    }
};

const validateRequestedImprovements = (improvementIds, requestedImprovements) => {
    if (requestedImprovements.length !== improvementIds.length) {
        throw new ImprovementRequestError(`Improvements not found: ${improvementIds}`);
    }
};

const validateImprovementOrder = (requestedImprovements) => {
    const subarrayIsContained = containsSubarray(ALL_IMPROVEMENTS.map(a => a.id), requestedImprovements.map(f => f.id));
    if (!subarrayIsContained) {
        throw new ImprovementRequestError(`Improper buying order. Must be 1, 2, 3.`);
    }
};

const validateImprovementsNotAlreadyBought = (progress, requestedImprovements) => {
    const ownedImprovements = progress.details.improvements || [];
    const itemsAlreadyBought = intersect(ownedImprovements.map(i => i.id), requestedImprovements.map(i => i.id));
    if (itemsAlreadyBought.length) {
        throw new ImprovementRequestError(`Improvement already bought: ${itemsAlreadyBought}`);
    }
};

const validatePrerequisites = (requestedImprovements, progress) => {
    if (!prerequisitesMet(requestedImprovements[0], [requestedImprovements, progress.details.improvements || []])) {
        throw new ImprovementRequestError(`Requisites not met`);
    }
};

const processImprovements = async (progress, requestedImprovements) => {
    const totalCost = requestedImprovements.reduce((acc, improvement) => acc + improvement.price, 0);
    if (totalCost > progress.details.stats.balance) {
        throw new InsufficientFundsError('Not enough funds!');
    }

    updateProgress(progress, requestedImprovements, totalCost);

    const { entity, statement } = ParticipantProgressRepository.upsertStatement(progress);
    const [savedProgress] = await execOnDatabase({ statement, parameters: entity });

    return sendResponse(HttpResponseCodes.OK, savedProgress);
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
