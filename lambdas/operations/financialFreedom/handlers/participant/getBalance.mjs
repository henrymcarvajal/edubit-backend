import { AssetRepository } from '../../../../../persistence/repositories/assetRepository.mjs';
import { ImprovementRepository } from '../../../../../persistence/repositories/improvementRepository.mjs';
import { HttpResponseCodes } from '../../../../../commons/web/webResponses.mjs';
import { ValueValidationMessages } from '../../../../../commons/messages.mjs';

import { authorizeAndFindParticipant } from '../../../../members/authorizers/participantAuthorizer.mjs';
import { getParticipantProgress } from '../../commons/getParticipantProgress.mjs';
import { handleErrorResponse } from '../../../../commons/errorHandling.mjs';
import { sendResponse } from '../../../../../util/responseHelper.mjs';
import { validate as uuidValidate } from 'uuid';

import { InvalidInputError } from '../../../../commons/errors/data/input.mjs';

export const handle = async (event) => {
  try {
    const { participantId, workshopExecutionId } = validateAndExtractParams(event);
    await authorizeAndFindParticipant(event, participantId);

    const progress = await getParticipantProgress(participantId, workshopExecutionId);
    const progressView = await createProgressView(progress.details);

    return sendResponse(HttpResponseCodes.OK, progressView);
  } catch (error) {
    return handleErrorResponse(error);
  }
};

const validateAndExtractParams = (event) => {
  const participantId = event.pathParameters.participantId;
  if (!uuidValidate(participantId)) {
    throw new InvalidInputError(`${ ValueValidationMessages.VALUE_IS_NOT_UUID } (participantId): ${ participantId }`);
  }

  const workshopExecutionId = event.pathParameters.workshopExecutionId;
  if (!uuidValidate(workshopExecutionId)) {
    throw new InvalidInputError(`${ ValueValidationMessages.VALUE_IS_NOT_UUID } (workshopExecutionId): ${ workshopExecutionId }`);
  }

  return { participantId, workshopExecutionId };
};

const createProgressView = async (details) => {
  const { improvements, assets, stats } = details;

  const balanceView = {
    stats
  };

  if (improvements) {
    balanceView.improvements = [];
    const improvementsDetails = await ImprovementRepository.findByIdIn(improvements.map(i => i.id));
    improvementsDetails.forEach((improvementDetail) => {
      balanceView.improvements.push(
          {
            id: improvementDetail.id,
            name: improvementDetail.name,
            imageUrl: improvementDetail.imageUrl
          });
    });
  }

  if (assets) {
    balanceView.assets = [];
    const assetsDetails = await AssetRepository.findByIdIn(assets.map(i => i.id));
    assets.forEach((asset) => {
      const details = assetsDetails.find(a => a.id === asset.id);
      asset.name = details.title;
      asset.imageUrl = details.imageUrl;
      balanceView.assets.push(asset);
    });
  }

  return balanceView;
};