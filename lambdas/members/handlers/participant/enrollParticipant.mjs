import WorkshopExecutionRepository from '../../../../persistence/repositories/workshopExecutionRepository.mjs';
import { HttpResponseCodes } from '../../../../commons/web/webResponses.mjs';
import { ValueValidationMessages } from '../../../../commons/messages.mjs';

import { authorizeAndFindParticipant } from '../../authorizers/participantAuthorizer.mjs';
import { execOnDatabase } from '../../../../util/dbHelper.mjs';
import { extractBody } from '../../../../client/aws/utils/bodyExtractor.mjs';
import { handleErrorResponse } from '../../../commons/errorHandling.mjs';
import { sendResponse } from '../../../../util/responseHelper.mjs';
import { validate as uuidValidate } from 'uuid';
import { validateEnrollmentActivities } from '../../../commons/validations/enrollment.mjs';

import { InvalidInputError } from '../../../commons/errors/data/input.mjs';
import { ResourceNotFoundError, ResourceUnmodifiedError } from '../../../commons/errors/integrity/resources.mjs';

exports.handle = async (event) => {
  try {
    const { participantId, enrollment } = validateAndExtractParams(event);
    await authorizeAndFindParticipant(event, participantId);

    const workshopExecution = await getWorkshopExecution(enrollment.workshopExecutionId);
    await validateEnrollmentActivities(enrollment.activities, workshopExecution.activities);

    const newEnrollment = enrollParticipant(workshopExecution, participantId, enrollment.activities);
    await saveWorkshopExecution(workshopExecution);

    return sendResponse(HttpResponseCodes.CREATED, newEnrollment);
  } catch (error) {
    return handleErrorResponse(error);
  }
};

const validateAndExtractParams = (event) => {
  const { id: participantId } = event.pathParameters;
  if (!uuidValidate(participantId)) {
    throw new InvalidInputError(`${ ValueValidationMessages.VALUE_IS_NOT_UUID } (participantId)}: ${ participantId }`);
  }

  const { body: enrollment } = extractBody(event);
  if (!enrollment) {
    throw new InvalidInputError(`Missing enrollment data`);
  }

  return { participantId, enrollment };
};

const getWorkshopExecution = async (workshopExecutionId) => {
  const [workshopExecution] = await WorkshopExecutionRepository.findById(workshopExecutionId);
  if (!workshopExecution) {
    throw new ResourceNotFoundError(`WorkshopExecution not found: ${ workshopExecutionId }`);
  }
  return workshopExecution;
};

const enrollParticipant = (workshopExecution, participantId, activities) => {
  const newEnrollment = {
    inscriptionDate: new Date(),
    activities
  };

  if (!workshopExecution.participants) {
    workshopExecution.participants = {};
    workshopExecution.participants[participantId] = newEnrollment;
  } else {
    const enrolledParticipantsIds = Object.keys(workshopExecution.participants);
    if (!enrolledParticipantsIds.includes(participantId)) {
      workshopExecution.participants[participantId] = newEnrollment;
    } else if (shouldUpdateActivities(workshopExecution.participants[participantId].activities, activities)) {
      workshopExecution.participants[participantId].activities = activities;
    } else {
      throw new ResourceUnmodifiedError();
    }
  }

  return newEnrollment;
};

const saveWorkshopExecution = async (workshopExecution) => {
  const { statement, entity } = WorkshopExecutionRepository.upsertStatement(workshopExecution);
  await execOnDatabase([{ statement: statement, parameters: entity }]);
};

const shouldUpdateActivities = (oldActivities, newActivities) => {
  const oldActivitiesValues = Object.values(oldActivities);
  const newActivitiesValues = Object.values(newActivities);

  if (oldActivitiesValues.length !== newActivitiesValues.length) return true;

  for (let i = 0; i < oldActivitiesValues.length; i++) {
    if (oldActivitiesValues[i] !== newActivitiesValues[i]) {
      return true;
    }
  }
  return false;
};