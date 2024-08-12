import ActivityRepository from '../../../../../persistence/repositories/activityRepository.mjs';
import AssetRepository from '../../../../../persistence/repositories/assetRepository.mjs';
import ImprovementRepository from '../../../../../persistence/repositories/improvementRepository.mjs';
import { HttpResponseCodes } from '../../../../../commons/web/webResponses.mjs';
import { ValueValidationMessages } from '../../../../../commons/messages.mjs';

import { authorizeAndFindParticipant } from '../../../../members/authorizers/participantAuthorizer.mjs';
import { getParticipantProgress } from '../../commons/getParticipantProgress.mjs';
import { handleErrorResponse } from '../../../../commons/errorHandling.mjs';
import { sendResponse } from '../../../../../util/responseHelper.mjs';
import { validate as uuidValidate } from 'uuid';

import { InvalidInputError } from '../../../../commons/errors/data/input.mjs';
import { arrayIsNotEmpty } from '../../../../../util/arrays.mjs';
import ParticipantRepository from '../../../../../persistence/repositories/participantRepository.mjs';

exports.handle = async (event) => {
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
  const { stats, state, currentActivity, history, improvements, assets, partnership } = details;

  const balanceView = {
    state,
    stats,
    history
  };

  balanceView.currentActivity = await buildActivityView(currentActivity);
  balanceView.improvements = await buildImprovementsView(improvements);
  balanceView.assets = await buildAssetsView(assets);
  balanceView.partnership = await buildPartnershipView(partnership);

  return balanceView;
};

const buildActivityView = async (currentActivity) => {
  if (currentActivity) {
    const [activity] = await ActivityRepository.findById(currentActivity.id);
    return { ...currentActivity, name: activity.name };
  }
};

const buildImprovementsView = async (improvements) => {
  if (arrayIsNotEmpty(improvements)) {
    const improvementsView = [];
    const improvementsDetails = await ImprovementRepository.findByIdIn(improvements.map(i => i.id));
    improvementsDetails.forEach((improvementDetail) => {
      improvementsView.push(
          {
            id: improvementDetail.id,
            name: improvementDetail.name,
            imageUrl: improvementDetail.imageUrl
          });
    });
    return improvementsView;
  }
};

const buildAssetsView = async (assets) => {
  if (arrayIsNotEmpty(assets)) {
    const assetsView = [];
    const assetsDetails = await AssetRepository.findByIdIn(assets.map(i => i.id));
    assets.forEach((asset) => {
      const details = assetsDetails.find(a => a.id === asset.id);
      asset.name = details.title;
      asset.imageUrl = details.imageUrl;
      assetsView.push(asset);
    });
    return assetsView;
  }
};

const buildPartnershipView = async (partnership) => {
  if (partnership) {
    const [participant] = await ParticipantRepository.findById(partnership.partnerId);
    return { ...partnership, partnerName: participant.name };
  }
}