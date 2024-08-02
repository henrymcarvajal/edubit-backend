import WorkshopRegistryRepository from '../../../../../persistence/repositories/workshopRegistryRepository.mjs';
import { ValueValidationMessages } from '../../../../../commons/messages.mjs';
import { WORKSHOP_OPERATION_NAMES } from '../../definitions/operations.mjs';

import { execOnDatabase } from '../../../../../util/dbHelper.mjs';
import { extractBody } from '../../../../../client/aws/utils/bodyExtractor.mjs';
import { validate as uuidValidate } from 'uuid';

import { InvalidInputError } from '../../../../commons/errors/data/input.mjs';

exports.handle = async (lambdaEvent) => {
  try {
    const { workshopExecutionId, participantName, operationName, list } = validateAndExtractParams(lambdaEvent);

    const event = verbalize(participantName, operationName, list);
    await saveEvent(workshopExecutionId, event);
  } catch (error) {
    console.error('Error on registering event', error);
  }
};

const validateAndExtractParams = (event) => {

  const { body } = extractBody(event);
  const workshopExecutionId = body.workshopExecutionId;
  const participantName = body.participantName;
  const operationName = body.operationName;

  const listEntry = Object.entries(body).filter(e => e[0] !== 'workshopExecutionId' && e[0] !== 'participantName' && e[0] !== 'operationName');
  const list = listEntry[0][1];

  if (!uuidValidate(workshopExecutionId)) {
    throw new InvalidInputError(`${ ValueValidationMessages.VALUE_IS_NOT_UUID } (workshopExecutionId): ${ workshopExecutionId }`);
  }

  return { workshopExecutionId, participantName, operationName, list };
};

const verbalize = (participantName, operationName, complement) => {

  console.log(participantName, operationName, complement);

  let playerName = participantName.split(' ')[0];
  let verb = '';
  let elements = ['', ''];
  let message = '';

  switch (operationName) {
    case WORKSHOP_OPERATION_NAMES.PARTICIPANT_BUY_IMPROVEMENT: {
      verb = 'comprar';
      elements = ['las', 'mejoras'];
      message = `${ playerName } acaba de ${ verb } ${ elements[0] } siguientes ${ elements[1] }: ${ complement.join(', ') }`;
      break;
    }
    case WORKSHOP_OPERATION_NAMES.PARTICIPANT_PURCHASE_ASSET: {
      verb = 'adquirir';
      elements = ['los', 'activos'];
      message = `${ playerName } acaba de ${ verb } ${ elements[0] } siguientes ${ elements[1] }: ${ complement.join(', ') }`;
      break;
    }
    case WORKSHOP_OPERATION_NAMES.MENTOR_APPROVE_LEVEL: {
      message = `${ playerName } acaba de subir al nivel ${ complement.level } de ${ complement.name }`;
      break;
    }
    case WORKSHOP_OPERATION_NAMES.PARTICIPANT_PROPOSE_PARTNERSHIP: {
      const { firstName: firstParticipantName, email: participantEmail } = extractFirstNameAndEmail(participantName);
      const { firstName: firstPartnerName, email: partnerEmail } = extractFirstNameAndEmail(complement.partnerName);
      message = `${ firstParticipantName } ${ participantEmail } le propone la sociedad ${ complement.partnershipName } a ${ firstPartnerName } ${ partnerEmail }`;
      break;
    }
    case WORKSHOP_OPERATION_NAMES.PARTICIPANT_ACCEPT_PARTNERSHIP: {
      const { firstName: firstParticipantName, email: fullPlayerEmail } = extractFirstNameAndEmail(participantName);
      const { firstName: firstPartnerName, email: fullPartnerEmail } = extractFirstNameAndEmail(complement.partnerName);
      message = `${ firstParticipantName } ${ fullPlayerEmail } acepta la sociedad ${ complement.partnershipName } a ${ firstPartnerName } ${ fullPartnerEmail }`;
      break;
    }
    default: {
      break;
    }
  }

  return message;
};

const saveEvent = async (workshopExecutionId, event) => {
  const { entity, statement } = WorkshopRegistryRepository
      .insertStatement({
        workshopExecutionId,
        event
      });

  await execOnDatabase({ statement: statement, parameters: entity });
};

const extractFirstNameAndEmail = (name) => {
  let separator = name.lastIndexOf(' ');
  const firstName = name.substring(0, separator).split(' ')[0];
  const email = name.substring(separator + 1);
  return { firstName, email };
};