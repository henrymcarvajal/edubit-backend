import ActivityRepository from '../../../../persistence/repositories/activityRepository.mjs';
import MentorRepository from '../../../../persistence/repositories/mentorRepository.mjs';
import WorkshopExecutionRepository from '../../../../persistence/repositories/workshopExecutionRepository.mjs';
import { HttpResponseCodes } from '../../../../commons/web/webResponses.mjs';
import { ValueValidationMessages } from '../../../../commons/messages.mjs';

import { authorizeAndFindParticipant } from '../../authorizers/participantAuthorizer.mjs';
import { handleErrorResponse } from '../../../commons/errorHandling.mjs';
import { sendResponse } from '../../../../util/responseHelper.mjs';
import { validate as uuidValidate } from 'uuid';

import { InvalidInputError } from '../../../commons/errors/data/input.mjs';

exports.handle = async (event) => {
  try {
    const participantId = validateAndExtractParams(event);
    const foundParticipant = await authorizeAndFindParticipant(event, participantId);

    const enrollments = await fetchEnrollments(foundParticipant.id);

    return sendResponse(HttpResponseCodes.OK, enrollments);
  } catch (error) {
    return handleErrorResponse(error);
  }
};

const validateAndExtractParams = (event) => {
  const { id: participantId } = event.pathParameters;
  if (!uuidValidate(participantId)) {
    throw new InvalidInputError(`${ ValueValidationMessages.VALUE_IS_NOT_UUID } (participantId)}: ${ participantId }`);
  }
  return participantId;
};

const fetchEnrollments = async (participantId) => {
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