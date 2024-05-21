import { HttpResponseCodes } from '../../../../commons/web/webResponses.mjs';
import { ValueValidationMessages } from '../../../../commons/messages.mjs';
import { WorkshopExecutionRepository } from '../../../../persistence/repositories/workshopExecutionRepository.mjs';

import { authorizeAndFindParticipant } from './participantAuthorizer.mjs';
import { handleMembersError } from '../errorHandling.mjs';
import { isUUID } from '../../../../commons/validations.mjs';
import { sendResponse } from '../../../../util/lambdaHelper.mjs';

export const handle = async (event) => {

  const id = event.pathParameters.id;
  if (!isUUID(id)) return sendResponse(HttpResponseCodes.BAD_REQUEST, { message: `${ ValueValidationMessages.VALUE_IS_NOT_UUID }: ${ id }` });

  const { profile: roles, email } = event.requestContext.authorizer.claims;

  try {
    const { participant: foundParticipant, response } = await authorizeAndFindParticipant(roles, id, email);
    if (response) return response;

    const enrollments = await findEnrollments(foundParticipant.id);

    return sendResponse(HttpResponseCodes.OK, enrollments);

  } catch (error) {
    return handleMembersError(error);
  }
};

const findEnrollments = async (participantId) => {

  const registeredWorkshops = await WorkshopExecutionRepository.findEnrollmentByParticipantId(participantId);

  const enrollments = [];
  for (const workshop of registeredWorkshops) {

    const activities = {};

    const participantActivities = workshop.participants[participantId].activities;

    for (const activitiesEntry of Object.entries(participantActivities)) {
      const activityId = activitiesEntry[1];
      const activity = { activityId: activityId };

      if (workshop.mentors) {

        const mentor = Object.entries(workshop.mentors)
            .find(entry => Object.values(entry[1].activities).includes(activityId));

        if (mentor) {
          activity.mentorId = mentor[0];
        }
      }
      activities[activitiesEntry[0]] = activity;
    }

    enrollments.push({ workshopId: workshop.id, scheduledDate: workshop.scheduledDate, activities: activities });
  }

  return enrollments;
};