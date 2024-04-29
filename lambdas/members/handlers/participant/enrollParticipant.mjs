import { HttpResponseCodes } from '../../../../commons/web/webResponses.mjs';
import { WorkshopExecutionRepository } from '../../../../persistence/repositories/workshopExecutionRepository.mjs';

import { authorizeAndFindParticipant } from './participantAuthorizer.mjs';
import { crossCheckActivities } from '../activityChecks.mjs';
import { execOnDatabase } from '../../../../util/dbHelper.mjs';
import { extractBody } from '../../../../client/aws/utils/bodyExtractor.mjs';
import { sendErrorResponse, sendResponse } from '../../../../util/lambdaHelper.mjs';

import { BusinessRuleValidationError } from '../../../commons/validations/error.mjs';

export const handle = async (event) => {

  const participantId = event.pathParameters.id;
  const {profile: roles, email} = event.requestContext.authorizer.claims;

  const {response} = await authorizeAndFindParticipant(roles, participantId, email);
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

    if (!workshopExecution.participants) {
      crossCheckActivities(Object.values(enrollment.activities), Object.values(workshopExecution.activities));
      workshopExecution.participants = {};
      workshopExecution.participants[participantId] = newEnrollment;
    } else {
      const enrolledParticipantsIds = Object.keys(workshopExecution.participants);
      if (!enrolledParticipantsIds.includes(participantId)) {
        crossCheckActivities(Object.values(enrollment.activities), Object.values(workshopExecution.activities));
        workshopExecution.participants[participantId] = newEnrollment;
      } else {
        return sendResponse(HttpResponseCodes.NO_CONTENT);
      }
    }

    const {statement, entity} = WorkshopExecutionRepository.upsertStatement(workshopExecution);
    await execOnDatabase([{statement: statement, parameters: entity}]);

    return sendResponse(HttpResponseCodes.CREATED, newEnrollment);
  } catch (error) {

    if (error instanceof BusinessRuleValidationError) {
      return sendResponse(HttpResponseCodes.BAD_REQUEST, {message: error.message});
    }

    return sendErrorResponse(HttpResponseCodes.INTERNAL_SERVER_ERROR, error);
  }
};