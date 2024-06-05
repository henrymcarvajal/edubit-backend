import { AssetRepository } from '../../../../../persistence/repositories/assetRepository.mjs';
import { ImprovementRepository } from '../../../../../persistence/repositories/improvementRepository.mjs';
import { HttpResponseCodes } from '../../../../../commons/web/webResponses.mjs';
import { ValueValidationMessages } from '../../../../../commons/messages.mjs';

import { authorizeAndFindParticipant } from './participantAuthorizer.mjs';
import { handleMembersError } from '../errorHandling.mjs';
import { sendResponse } from '../../../../../util/responseHelper.mjs';
import { validate as uuidValidate } from 'uuid';
import { getParticipantProgress } from './participanProgress.mjs';

import { InvalidUuidError } from '../../../../commons/validations/error.mjs';

export const handle = async (event) => {

  try {

    const { participantId, workshopExecutionId } = validateAndExtractParams(event);
    const { response } = await authorizeAndFindParticipant(event, participantId);
    if (response) return response;

    const progress = await getParticipantProgress(participantId, workshopExecutionId);

    const { stats, improvements, assets, history, startingBalance } = progress.details;

    const progressView = {
      stats,
      history,
      startingBalance
    };

    if (improvements) {
      progressView.improvements = [];
      const improvementsDetails = await ImprovementRepository.findByIdIn(improvements.map(i => i.id));
      improvementsDetails.forEach((improvementDetail) => {
        progressView.improvements.push({ id: improvementDetail.id, name: improvementDetail.name });
      });
    }

    if (assets) {
      progressView.assets = [];
      const assetsDetails = await AssetRepository.findByIdIn(assets.map(i => i.id));
      assets.forEach((asset) => {
        asset.name = assetsDetails.find(a => a.id === asset.id).title;
        progressView.assets.push(asset);
      });
    }

    return sendResponse(HttpResponseCodes.OK, progressView);

  } catch (error) {
    return handleMembersError(error);
  }
};


const validateAndExtractParams = (event) => {

  const participantId = event.pathParameters.participantId;
  const workshopExecutionId = event.pathParameters.workshopExecutionId;

  if (!uuidValidate(participantId)) {
    throw new InvalidUuidError(`${ ValueValidationMessages.VALUE_IS_NOT_UUID } (participantId): ${ participantId }`);
  }

  if (!uuidValidate(workshopExecutionId)) {
    throw new InvalidUuidError(`${ ValueValidationMessages.VALUE_IS_NOT_UUID } (workshopExecutionId): ${ workshopExecutionId }`);
  }

  return { participantId, workshopExecutionId };
};