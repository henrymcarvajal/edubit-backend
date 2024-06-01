import { HttpResponseCodes } from '../../../../commons/web/webResponses.mjs';
import { WorkshopExecutionRepository } from '../../../../persistence/repositories/workshopExecutionRepository.mjs';

import { authorizeAndFindMentor } from './mentorAuthorizer.mjs';
import { crossCheckActivities } from '../activityChecks.mjs';
import { execOnDatabase } from '../../../../util/dbHelper.mjs';
import { extractBody } from '../../../../client/aws/utils/bodyExtractor.mjs';
import { sendResponse } from '../../../../util/responseHelper.mjs';

import { FailedValidationError } from '../../../commons/validations/error.mjs';

export const handle = async (event) => {

  const mentorId = event.pathParameters.id;
  const {profile: roles, email} = event.requestContext.authorizer.claims;

  const {response} = await authorizeAndFindMentor(roles, mentorId, email);
  if (response) return response;

  try {
    const {body: enrollment} = extractBody(event);

    const [workshopExecution] = await WorkshopExecutionRepository.findById(enrollment.workshopExecutionId);
    if (!workshopExecution) return sendResponse(
        HttpResponseCodes.NOT_FOUND,
        {message: `WorkshopExecution not found: ${enrollment.workshopExecutionId}`}
    );

    const newEnrollment = {
      inscriptionDate: new Date(),
      activities: enrollment.activities
    };

    if (!workshopExecution.mentors) {
      crossCheckActivities(Object.values(enrollment.activities), Object.values(workshopExecution.activities));
      workshopExecution.mentors = {};
      workshopExecution.mentors[mentorId] = newEnrollment;
    } else {
      const enrolledMentorsIds = Object.keys(workshopExecution.mentors);
      if (!enrolledMentorsIds.includes(mentorId)) {
        crossCheckActivities(Object.values(enrollment.activities), Object.values(workshopExecution.activities));
        workshopExecution.mentors[mentorId] = newEnrollment;
      } else {
        return sendResponse(HttpResponseCodes.NO_CONTENT);
      }
    }

    const {statement, entity} = WorkshopExecutionRepository.upsertStatement(workshopExecution);
    await execOnDatabase([{statement: statement, parameters: entity}]);

    return sendResponse(HttpResponseCodes.CREATED, newEnrollment);
  } catch (error) {

    if (error instanceof FailedValidationError) {
      return sendResponse(HttpResponseCodes.BAD_REQUEST, {message: error.message});
    }

    return sendResponse(HttpResponseCodes.INTERNAL_SERVER_ERROR, error, true);
  }
};