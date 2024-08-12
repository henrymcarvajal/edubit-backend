import ActivityRepository from '../../../../persistence/repositories/activityRepository.mjs';
import WorkshopExecutionRepository from '../../../../persistence/repositories/workshopExecutionRepository.mjs';
import { HttpResponseCodes } from '../../../../commons/web/webResponses.mjs';
import ParticipantRepository from '../../../../persistence/repositories/participantRepository.mjs';
import { ValueValidationMessages } from '../../../../commons/messages.mjs';

import { handleErrorResponse } from '../../../commons/errorHandling.mjs';
import { sendResponse } from '../../../../util/responseHelper.mjs';
import { validate as uuidValidate } from 'uuid';

import { InvalidInputError } from '../../../commons/errors/data/input.mjs';

let ALL_ACTIVITIES;

exports.handle = async (event) => {

  try {
    const workshopExecutionId = validateAndExtractParams(event);

    const [workshopExecution] = await WorkshopExecutionRepository.findById(workshopExecutionId);
    if (!workshopExecution || !workshopExecution.participants) return sendResponse(HttpResponseCodes.NOT_FOUND);

    const participantsView = await processActivities(workshopExecution.participants);
    return sendResponse(HttpResponseCodes.OK, participantsView);
  } catch (error) {
    return handleErrorResponse(error);
  }
};

const initializeActivities = async () => {
  const toView = (activity) => ({
    id: activity.id,
    name: activity.name
  });

  if (!ALL_ACTIVITIES) {
    ALL_ACTIVITIES = (await ActivityRepository.findAll()).map(toView);
  }
};

const validateAndExtractParams = (event) => {
  const workshopExecutionId = event.pathParameters.id;

  if (!uuidValidate(workshopExecutionId)) {
    throw new InvalidInputError(`${ ValueValidationMessages.VALUE_IS_NOT_UUID } (workshopExecutionId)}: ${ workshopExecutionId }`);
  }

  return workshopExecutionId;
};

const processActivities = async (participants) => {

  await initializeActivities();

  const mappedParticipants = {};

  const foundParticipants = await ParticipantRepository.findByIdIn(Object.keys(participants));

  for (let participantId of Object.keys(participants)) {

    const toActivity = (activityId) => {
      const activity = ALL_ACTIVITIES.find(activity => activity.id === activityId);
      return {
        id: activityId,
        name: activity ? activity.name : 'ND'
      };
    };

    const activities = Object.values(participants[participantId].activities).map(toActivity);

    const participant = foundParticipants.find((m) => m.id === participantId);

    mappedParticipants[participantId] = {
      id: participantId,
      name: participant ? participant.name : 'ND',
      activities: activities
    };
  }

  return Object.values(mappedParticipants);
};