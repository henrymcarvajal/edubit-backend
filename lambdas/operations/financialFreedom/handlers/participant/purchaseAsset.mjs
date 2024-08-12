import AssetRepository from '../../../../../persistence/repositories/assetRepository.mjs';
import ParticipantProgressRepository from '../../../../../persistence/repositories/participantProgressRepository.mjs';
import { AwsInfo } from '../../../../../client/aws/AwsInfo.mjs';
import { BUYER_OPTIONS } from '../../commons/constants.mjs';
import { FINANCIAL_SOURCES_OPTIONS } from '../../commons/calculators/financialSources.mjs';
import { HttpResponseCodes } from '../../../../../commons/web/webResponses.mjs';
import { PartnershipMessages } from '../../commons/messages/partnershipMessages.mjs';
import { PARTNERSHIP_STATUS } from '../../definitions/partnershipStatus.mjs';
import { PurchasesMessages } from '../../commons/messages/purchasesMessages.mjs';
import { ValueValidationMessages } from '../../../../../commons/messages.mjs';
import { WORKSHOP_OPERATION_NAMES } from '../../definitions/operations.mjs';

import makePurchase from '../../commons/calculators/purchasesManager.mjs';
import { arrayIsNotEmpty } from '../../../../../util/arrays.mjs';
import { authorizeAndFindParticipant } from '../../../../members/authorizers/participantAuthorizer.mjs';
import { extractBody } from '../../../../../client/aws/utils/bodyExtractor.mjs';
import { execOnDatabase } from '../../../../../util/dbHelper.mjs';
import { getAuthorizationResult } from '../../commons/getAuthorizationResult.mjs';
import { getParticipantProgress } from '../../commons/getParticipantProgress.mjs';
import { handleErrorResponse } from '../../../../commons/errorHandling.mjs';
import { invokeLambda } from '../../../../../client/aws/clients/lambdaClient.mjs';
import { sendResponse } from '../../../../../util/responseHelper.mjs';

import { validate as uuidValidate } from 'uuid';
import { ForbiddenOperationError } from '../../../../commons/errors/security/restrictedAccess.mjs';
import { InvalidInputError } from '../../../../commons/errors/data/input.mjs';
import { ResourceStateError } from '../../../../commons/errors/integrity/resources.mjs';
import { LOANS_TERMS } from '../../commons/loans.mjs';

exports.handle = async (event) => {
  try {
    const { participantId, workshopExecutionId, purchase } = validateAndExtractParams(event);

    const participant = await authorizeAndFindParticipant(event, participantId);

    await authorizeOperation(workshopExecutionId, participantId);

    const progresses = await validatePartnership(participantId, workshopExecutionId, purchase.buyer);
    purchase.assets = await validateAssetsIds(purchase.assetIds);

    const [savedProgress] = await processAssets(progresses, purchase);

    await notifyEvent(workshopExecutionId, participant, purchase.assets);

    return sendResponse(HttpResponseCodes.OK, savedProgress.details);
  } catch (error) {
    return handleErrorResponse(error);
  }
};

const validateAndExtractParams = (event) => {
  const participantId = event.pathParameters.participantId;
  if (!uuidValidate(participantId)) {
    throw new InvalidInputError(`${ ValueValidationMessages.VALUE_IS_NOT_UUID } (participantId)}: ${ participantId }`);
  }

  const workshopExecutionId = event.pathParameters.workshopExecutionId;
  if (!uuidValidate(workshopExecutionId)) {
    throw new InvalidInputError(`${ ValueValidationMessages.VALUE_IS_NOT_UUID } (workshopExecutionId)}: ${ workshopExecutionId }`);
  }

  const { body: { assetIds, source, installments, buyer } } = extractBody(event);
  if (arrayIsNotEmpty(assetIds)) {
    assetIds.forEach((assetId) => {
      if (!uuidValidate(assetId)) {
        throw new InvalidInputError(`${ ValueValidationMessages.VALUE_IS_NOT_UUID } (assetId)}: ${ assetId }`);
      }
    });
  } else {
    throw new InvalidInputError(PurchasesMessages.MISSING_ASSETS_TO_BUY);
  }

  if (source) {
    const sourceKeys = Object.keys(FINANCIAL_SOURCES_OPTIONS);
    if (!sourceKeys.includes(source)) {
      throw new InvalidInputError(PurchasesMessages.INVALID_SOURCE);
    }
  }

  if (installments) {
    if (source === FINANCIAL_SOURCES_OPTIONS.MORTGAGE) {
      if (installments > LOANS_TERMS.MORTGAGE.MAX_INSTALLMENTS) {
        throw new InvalidInputError(PurchasesMessages.INSTALLMENTS_EXCEED_MAX_ALLOWED_INSTALLMENTS(installments, LOANS_TERMS.MORTGAGE.MAX_INSTALLMENTS));
      }
    } else if (source === FINANCIAL_SOURCES_OPTIONS.PERSONAL_LOAN) {
      if (installments > LOANS_TERMS.PERSONAL_LOAN.MAX_INSTALLMENTS) {
        throw new InvalidInputError(PurchasesMessages.INSTALLMENTS_EXCEED_MAX_ALLOWED_INSTALLMENTS(installments, LOANS_TERMS.PERSONAL_LOAN.MAX_INSTALLMENTS));
      }
    }
  } else if (source !== FINANCIAL_SOURCES_OPTIONS.FUNDS) {
    throw new InvalidInputError(PurchasesMessages.MISSING_INSTALLMENTS);
  }

  if (buyer) {
    const buyerKeys = Object.keys(BUYER_OPTIONS);
    if (!buyerKeys.includes(buyer)) {
      throw new InvalidInputError(PurchasesMessages.INVALID_BUYER);
    }
  }

  const purchase =  {assetIds, source, buyer, installments}

  return { participantId, workshopExecutionId, purchase};
};

const authorizeOperation = async (workshopExecutionId, participantId) => {
  const operation = WORKSHOP_OPERATION_NAMES.PARTICIPANT_PURCHASE_ASSET;
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

const validatePartnership = async (participantId, workshopExecutionId, buyer) => {
  const progress = await getParticipantProgress(participantId, workshopExecutionId);
  let progresses = [progress];

  if (buyer === BUYER_OPTIONS.PARTNERSHIP) {
    checkPartnership(progress);

    const otherProgress = await getParticipantProgress(progress.details.partnership.partnerId, workshopExecutionId);
    checkPartnership(otherProgress);

    progresses = [...progresses, otherProgress];
  }

  return progresses;
};

const checkPartnership = (progress) => {
  if (!progress.details.partnership) {
    throw new ResourceStateError(PartnershipMessages.PARTNERSHIP_NON_EXISTENT);
  }

  if (progress.details.partnership.status !== PARTNERSHIP_STATUS.CONFIRMED) {
    throw new ResourceStateError(PartnershipMessages.PARTNERSHIP_NOT_CONFIRMED);
  }
};

const validateAssetsIds = async (assetIds) => {
  const foundAssets = await AssetRepository.findByIdIn(assetIds);
  if (!assetIds || (assetIds.length !== foundAssets.length)) {
    throw new InvalidInputError(`Invalid assets ids`);
  }

  return foundAssets;
};

const processAssets = async (progresses, purchase) => {
  purchase.buyer = purchase.buyer || BUYER_OPTIONS.PARTICIPANT;

  const totalCostPerParticipant = makePurchase(progresses, purchase);

  updateAssets(progresses, purchase.assets, purchase.buyer);
  updateBalances(progresses, totalCostPerParticipant, purchase.buyer);

  return await saveProgresses(progresses);
};

const updateBalances = (progresses, totalCostPerParticipant) => {
  for (const progress of progresses) {
    progress.details.stats.balance -= totalCostPerParticipant;
  }
};

const updateAssets = (progresses, foundAssets, buyer) => {

  const addAssets = (assets, foundAssets) => {
    for (const foundAsset of foundAssets) {
      let index = assets.find(a => a.id === foundAsset.id);
      if (index) {
        index.count++;
      } else {
        assets.push({
          id: foundAsset.id,
          count: 1,
          type: foundAsset.type,
          value: foundAsset.price
        });
      }
    }
  };

  for (const progress of progresses) {
    if (buyer === BUYER_OPTIONS.PARTICIPANT) {
      if (!progress.details.assets) {
        progress.details.assets = [];
      }

      addAssets(progress.details.assets, foundAssets)
    } else {
      if (!progress.details.partnership.assets) {
        progress.details.partnership.assets = [];
      }

      addAssets(progress.details.partnership.assets, foundAssets)
    }
  }
};

const saveProgresses = async (progresses) => {
  const savedProgresses = [];
  for (const progress of progresses) {
    const { entity, statement } = ParticipantProgressRepository.upsertStatement(progress);
    const [savedProgress] = await execOnDatabase({ statement: statement, parameters: entity });
    savedProgresses.push(savedProgress);
  }
  return savedProgresses;
};

const notifyEvent = async (workshopExecutionId, participant, requestedAssets) => {
  /*const participantName = participant.name;
  const assetNames = requestedAssets.map(i => i.title);
  await messageQueue(AwsInfo.EVENT_REGISTRY_QUEUE, {
    workshopExecutionId,
    participantName,
    operationName: WORKSHOP_OPERATION_NAMES.PARTICIPANT_PURCHASE_ASSET,
    assetIds: assetNames
  });*/
};

