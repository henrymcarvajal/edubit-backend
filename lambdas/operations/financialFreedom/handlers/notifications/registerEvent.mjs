import { ValueValidationMessages } from '../../../../../commons/messages.mjs';
import { WorkshopRegistryRepository } from '../../../../../persistence/repositories/workshopRegistryRepository.mjs';

import { execOnDatabase } from '../../../../../util/dbHelper.mjs';
import { extractBody } from '../../../../../client/aws/utils/bodyExtractor.mjs';
import { validate as uuidValidate } from 'uuid';

import { InvalidUuidError } from '../../../../commons/validations/error.mjs';
import { WORKSHOP_OPERATION_NAMES } from '../../definitions/operations.mjs';

export const handle = async (lambdaEvent) => {
  try {

    const { workshopExecutionId, participantName, operationName, list } = validateAndExtractParams(lambdaEvent);

    const event = verbalize(participantName, operationName, list);

    const { entity, statement } = WorkshopRegistryRepository
        .insertStatement({
          workshopExecutionId,
          event
        });

    const savedEvent = await execOnDatabase({ statement: statement, parameters: entity });

    console.error('Success saving event', savedEvent);
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
    throw new InvalidUuidError(`${ ValueValidationMessages.VALUE_IS_NOT_UUID } (workshopExecutionId): ${ workshopExecutionId }`);
  }

  return { workshopExecutionId, participantName, operationName, list };
};

const verbalize = (participantName, operationName, list) => {

  let verb = '';
  let elements = ['', ''];

  switch (operationName) {
    case WORKSHOP_OPERATION_NAMES.PARTICIPANT_BUY_IMPROVEMENT: {
      verb = 'comprar';
      elements = ['las', 'mejoras'];
      break;
    }
    case WORKSHOP_OPERATION_NAMES.PARTICIPANT_PURCHASE_ASSET: {
      verb = 'adquirir';
      elements = ['los', 'activos'];
      break;
    }
    default: {
      break;
    }
  }

  return `${ participantName.split(' ')[0] } acaba de ${ verb } ${ elements[0] } siguientes ${ elements[1] }: ${ list.join(', ') }`;
};