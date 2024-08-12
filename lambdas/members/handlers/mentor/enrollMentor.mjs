import { HttpResponseCodes } from '../../../../commons/web/webResponses.mjs';
import { ValueValidationMessages } from '../../../../commons/messages.mjs';
import WorkshopExecutionRepository from '../../../../persistence/repositories/workshopExecutionRepository.mjs';

import { authorizeAndFindMentor } from '../../authorizers/mentorAuthorizer.mjs';
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
    const { mentorId, enrollment } = validateAndExtractParams(event);
    await authorizeAndFindMentor(event, mentorId);

    const workshopExecution = await getWorkshopExecution(enrollment.workshopExecutionId);
    await validateEnrollmentActivities(enrollment.activities, workshopExecution.activities);

    const newEnrollment = enrollMentor(workshopExecution, mentorId, enrollment.activities);
    await saveWorkshopExecution(workshopExecution);

    return sendResponse(HttpResponseCodes.CREATED, newEnrollment);
  } catch (error) {
    return handleErrorResponse(error);
  }
};

const validateAndExtractParams = (event) => {
  const { id: mentorId } = event.pathParameters;
  if (!uuidValidate(mentorId)) {
    throw new InvalidInputError(`${ ValueValidationMessages.VALUE_IS_NOT_UUID } (mentorId)}: ${ mentorId }`);
  }

  const { body: enrollment } = extractBody(event);
  if (!enrollment) {
    throw new InvalidInputError(`Missing enrollment data`);
  }

  return { mentorId, enrollment };
};

const getWorkshopExecution = async (workshopExecutionId) => {
  const [workshopExecution] = await WorkshopExecutionRepository.findById(workshopExecutionId);
  if (!workshopExecution) {
    throw new ResourceNotFoundError(`WorkshopExecution not found: ${ workshopExecutionId }`);
  }
  return workshopExecution;
};

const enrollMentor = (workshopExecution, mentorId, activities) => {
  const newEnrollment = {
    inscriptionDate: new Date(),
    activities
  };

  if (!workshopExecution.mentors) {
    workshopExecution.mentors = {};
    workshopExecution.mentors[mentorId] = newEnrollment;
  } else {
    const enrolledMentorsIds = Object.keys(workshopExecution.mentors);
    if (!enrolledMentorsIds.includes(mentorId)) {
      workshopExecution.mentors[mentorId] = newEnrollment;
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