import { AssetRepository } from '../../../../persistence/repositories/assetRepository.mjs';
import { HttpResponseCodes } from '../../../../commons/web/webResponses.mjs';
import { ParticipantProgressRepository } from '../../../../persistence/repositories/participantProgressRepository.mjs';
import { ValueValidationMessages } from '../../../../commons/messages.mjs';

import { authorizeAndFindParticipant } from './participantAuthorizer.mjs';
import { handleMembersError } from '../errorHandling.mjs';
import { sendResponse } from '../../../../util/lambdaHelper.mjs';
import { extractBody } from '../../../../client/aws/utils/bodyExtractor.mjs';
import { execOnDatabase } from '../../../../util/dbHelper.mjs';
import { validate as uuidValidate } from 'uuid';

export const handle = async (event) => {

  const { body } = extractBody(event);

  const participantId = event.pathParameters.id;
  const workshopExecutionId = event.pathParameters.workshopExecutionId;

  if (!uuidValidate(participantId)) return sendResponse(HttpResponseCodes.BAD_REQUEST, { message: `${ ValueValidationMessages.VALUE_IS_NOT_UUID }: ${ participantId }` });
  if (!uuidValidate(workshopExecutionId)) return sendResponse(HttpResponseCodes.BAD_REQUEST, { message: `${ ValueValidationMessages.VALUE_IS_NOT_UUID }: ${ workshopExecutionId }` });

  const { profile: roles, email } = event.requestContext.authorizer.claims;

  try {
    const { response } = await authorizeAndFindParticipant(roles, participantId, email);
    if (response) return response;

    const [progress] = await ParticipantProgressRepository.findByParticipantIdAndWorkshopExecutionId(participantId, workshopExecutionId);
    if (!progress) return sendResponse(HttpResponseCodes.NOT_FOUND, { message: `Participant progress not found: ${ participantId }, ${ workshopExecutionId }` });

    const foundAssets = await AssetRepository.findByIdIn(body.assetIds);

    const totalCost = foundAssets.reduce((accumulator, asset) => accumulator + asset.price, 0);

    if (totalCost < progress.details.stats.balance) {
      if (!progress.details.assets) {
        progress.details.assets = [];
      }

      for (const foundAsset of foundAssets) {
        let index = progress.details.assets.find(a => a.id === foundAsset.id);
        if (index) {
          index.count++;
        } else {
          progress.details.assets.push({ id: foundAsset.id, count: 1 });
        }
      }

      progress.details.stats.balance -= totalCost;

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