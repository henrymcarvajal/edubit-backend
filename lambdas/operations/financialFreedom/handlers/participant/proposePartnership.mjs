import ParticipantProgressRepository from '../../../../../persistence/repositories/participantProgressRepository.mjs';
import ParticipantRepository from '../../../../../persistence/repositories/participantRepository.mjs';
import { AwsInfo } from '../../../../../client/aws/AwsInfo.mjs';
import { HttpResponseCodes } from '../../../../../commons/web/webResponses.mjs';
import { PARTNERSHIP_STATUS } from '../../definitions/partnershipStatus.mjs';
import { PartnershipMessages } from '../../commons/messages/partnershipMessages.mjs';
import { ValueValidationMessages } from '../../../../../commons/messages.mjs';
import { WORKSHOP_OPERATION_NAMES } from '../../definitions/operations.mjs';

import { authorizeAndFindParticipant } from '../../../../members/authorizers/participantAuthorizer.mjs';
import { execOnDatabase } from '../../../../../util/dbHelper.mjs';
import { extractBody } from '../../../../../client/aws/utils/bodyExtractor.mjs';
import { getAuthorizationResult } from '../../commons/getAuthorizationResult.mjs';
import { getParticipantProgress } from '../../commons/getParticipantProgress.mjs';
import { handleErrorResponse } from '../../../../commons/errorHandling.mjs';
import { invokeLambda } from '../../../../../client/aws/clients/lambdaClient.mjs';
import { isEmptyString } from '../../../../../util/string.mjs';
import { messageQueue } from '../../../../../client/aws/clients/sqsClient.mjs';
import { sendEmail } from '../../../../../util/emailHelper.mjs';
import { sendResponse } from '../../../../../util/responseHelper.mjs';
import { validateEmail } from '../../../../../util/generalValidations.mjs';

import { ForbiddenOperationError } from '../../../../commons/errors/security/restrictedAccess.mjs';
import { InvalidInputError } from '../../../../commons/errors/data/input.mjs';
import { ResourceNotFoundError, ResourceStateError } from '../../../../commons/errors/integrity/resources.mjs';
import { validate as uuidValidate } from 'uuid';

exports.handle = async (event) => {
  try {
    const { participantId, workshopExecutionId, partnerEmail, partnershipName } = await validateAndExtractParams(event);
    const participant = await authorizeAndFindParticipant(event, participantId);

    const participantProgress = await getParticipantProgress(participantId, workshopExecutionId);
    const partnerProgress = await getPartnerProgress(partnerEmail, workshopExecutionId);

    const partnerShip = await createPartnershipProposal(participantProgress, partnerProgress, partnershipName);
    await updateProgress(participantProgress);

    await notifyEvent(workshopExecutionId, participantProgress, partnerProgress, partnershipName);

    return sendResponse(HttpResponseCodes.OK, partnerShip);
  } catch (error) {
    return handleErrorResponse(error);
  }
};

const validateAndExtractParams = async (event) => {
  const participantId = event.pathParameters.participantId;
  if (!uuidValidate(participantId)) {
    throw new InvalidInputError(`${ ValueValidationMessages.VALUE_IS_NOT_UUID } (participantId)}: ${ participantId }`);
  }

  const workshopExecutionId = event.pathParameters.workshopExecutionId;
  if (!uuidValidate(workshopExecutionId)) {
    throw new InvalidInputError(`${ ValueValidationMessages.VALUE_IS_NOT_UUID } (workshopExecutionId): ${ workshopExecutionId }`);
  }

  const { body: { partnerEmail, partnershipName } } = extractBody(event);
  await validateEmail(partnerEmail);

  if (isEmptyString(partnershipName)) {
    throw new InvalidInputError(`Nombre no puede ser vacío`);
  }

  return { participantId, workshopExecutionId, partnerEmail, partnershipName };
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

export const getPartnerProgress = async (participantEmail, workshopExecutionId) => {
  const [participant] = await ParticipantRepository.findByEmail(participantEmail);
  if (!participant) {
    throw new ResourceNotFoundError(PartnershipMessages.PARTICIPANT_NOT_FOUND(participantEmail));
  }

  const [progress] = await ParticipantProgressRepository.findByParticipantIdAndWorkshopExecutionId(participant.id, workshopExecutionId);
  if (!progress) {
    throw new ResourceNotFoundError(PartnershipMessages.PARTICIPANT_PROGRESS_NOT_FOUND( participant.id , workshopExecutionId ));
  }
  return progress;
};

const createPartnershipProposal = async (participantProgress, partnerProgress, partnershipName) => {
  if (participantProgress.participantId === partnerProgress.participantId) {
    throw new InvalidInputError(PartnershipMessages.PARTNER_CANNOT_PARTNER_WITH_HIMSELF);
  }

  const { details } = participantProgress;
  if (details.partnership?.status && details.partnership.status === PARTNERSHIP_STATUS.CONFIRMED) {
    throw new ResourceStateError(PartnershipMessages.PARTNERSHIP_ALREADY_CONFIRMED);
  }

  details.partnership = {
    partnerId: partnerProgress.participantId,
    name: partnershipName,
    status: PARTNERSHIP_STATUS.PENDING
  };

  return details.partnership;
};

const updateProgress = async (progress) => {
  progress.modificationDate = new Date();
  const { entity, statement } = ParticipantProgressRepository.upsertStatement(progress);
  await execOnDatabase({ statement, parameters: entity });
};

const notifyEvent = async (workshopExecutionId, participantProgress, partnerProgress, partnershipName) => {
  const [participant] = await ParticipantRepository.findById(participantProgress.participantId);
  const participantName = `${ participant.name } (${ participant.email })`;

  const [partner] = await ParticipantRepository.findById(partnerProgress.participantId);
  const partnerName = `${ partner.name } (${ partner.email })`;

  await sendEventNotification(workshopExecutionId, participantName, partnerName, partnershipName);
  await sendPartnerEmail(partner, partnershipName);
};

const sendEventNotification = async (workshopExecutionId, participantName, partnerName, partnershipName) => {
  await messageQueue(AwsInfo.EVENT_REGISTRY_QUEUE, {
        workshopExecutionId,
        participantName,
        operationName: WORKSHOP_OPERATION_NAMES.PARTICIPANT_PROPOSE_PARTNERSHIP,
        complement: { partnerName, partnershipName }
      }
  );
};

const sendPartnerEmail = async (partner, partnershipName) => {
  const message = {
    recipients: [partner.email],
    subject: 'Te han propuesto una sociedad en el taller.',
    contents: {
      template: 'title_description',
      replacements: {
        title: 'Sociedad en Edubit',
        h1: partnershipName,
        description: `${ partner.name } (${ partner.email }) ha decidido formar una sociedad contigo. Revisa tu tablero para aceptarla.`
      }
    }
  };

  await sendEmail([message], false);
};