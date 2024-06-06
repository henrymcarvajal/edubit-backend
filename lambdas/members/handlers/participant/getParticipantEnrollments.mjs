import { ActivityRepository } from '../../../../persistence/repositories/activityRepository.mjs';
import { HttpResponseCodes } from '../../../../commons/web/webResponses.mjs';
import { MentorRepository } from '../../../../persistence/repositories/mentorRepository.mjs';
import { ValueValidationMessages } from '../../../../commons/messages.mjs';
import { WorkshopExecutionRepository } from '../../../../persistence/repositories/workshopExecutionRepository.mjs';

import { authorizeAndFindParticipant } from './participantAuthorizer.mjs';
import { handleMembersError } from '../errorHandling.mjs';
import { sendResponse } from '../../../../util/responseHelper.mjs';
import { validate as uuidValidate } from 'uuid';

export const handle = async (event) => {

  const id = event.pathParameters.id;
  if (!uuidValidate(id)) return sendResponse(HttpResponseCodes.BAD_REQUEST, { message: `${ ValueValidationMessages.VALUE_IS_NOT_UUID }: ${ id }` });

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

  const enrollments = {};

  const registeredWorkshops = await WorkshopExecutionRepository.findEnrollmentByParticipantId(participantId);
  for (const workshopExecution of registeredWorkshops) {

    const workshopHasStarted = workshopExecution.startTimestamp && (new Date(workshopExecution.startTimestamp) < new Date());
    const workshopHasFinished = !!workshopExecution.endTimestamp;

    const enrollment = await fillEnrollment(workshopExecution, participantId);
    if (!workshopHasStarted) {
      if (!enrollments.incoming) {
        enrollments.incoming = [];
      }
      enrollments.incoming.push(enrollment);
    } else if (!workshopHasFinished) {
      enrollments.current = enrollment;
    }
  }

  return enrollments;
};

const fillEnrollment = async (workshopExecution, participantId) => {

  const activities = {};

  const participantActivities = workshopExecution.participants[participantId].activities;

  const foundActivities = await ActivityRepository.findByIdIn(Object.values(participantActivities));

  for (const activitiesEntry of Object.entries(participantActivities)) {
    const activityId = activitiesEntry[1];
    const activity = { id: activityId };
    activity.name = foundActivities.find(activity => activity.id === activityId).name;

    if (workshopExecution.mentors) {
      const mentor = Object.entries(workshopExecution.mentors)
          .find(entry => Object.values(entry[1].activities).includes(activityId));

      if (mentor) {
        const [foundMentor] = await MentorRepository.findById(mentor[0]);
        if (foundMentor) {
          activity.mentor = {};
          activity.mentor.id = foundMentor.id;
          activity.mentor.name = foundMentor.name;
        }
      }
    }
    activities[activitiesEntry[0]] = activity;
  }

  return {
    workshopExecutionId: workshopExecution.id,
    workshopName: workshopExecution.workshopName,
    scheduledDate: workshopExecution.scheduledDate,
    startTimestamp: workshopExecution.startTimestamp,
    activities
  };
};