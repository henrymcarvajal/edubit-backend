import ActivityRepository from '../../../../persistence/repositories/activityRepository.mjs';
import ParticipantProgressRepository from '../../../../persistence/repositories/participantProgressRepository.mjs';
import WorkshopExecutionRepository from '../../../../persistence/repositories/workshopExecutionRepository.mjs';
import { AwsInfo } from '../../../../client/aws/AwsInfo.mjs';

import { arrayIsEmpty } from '../../../../util/arrays.mjs';
import { execOnDatabase } from '../../../../util/dbHelper.mjs';
import { extractBody } from '../../../../client/aws/utils/bodyExtractor.mjs';
import { messageQueue } from '../../../../client/aws/clients/sqsClient.mjs';

import { ResourceNotFoundError } from '../../../commons/errors/integrity/resources.mjs';

const ALL_ACTIVITIES = [];
const STARTING_BALANCE = 10000000;
const STARTING_EXPENSES = 3000000;
const TRIGGER_BALANCE_CALCULATION_MINUTES = 2;

exports.handle = async (event) => {
  try {
    const workshopExecutionId = validateAndExtractParams(event);
    const workshopExecution = await fetchWorkshopExecution(workshopExecutionId);

    if (workshopExecution.elapsedTime <= 1) {
      await initializeParticipantsProgress(workshopExecution);
      return;
    }

    if ((workshopExecution.elapsedTime % TRIGGER_BALANCE_CALCULATION_MINUTES) === 0) {
      await calculateMonthlyBalances(workshopExecution.id, workshopExecution.elapsedTime);
    }
  } catch (error) {
    console.log(error);
  }
};

const initializeParticipantsProgress = async (workshopExecution) => {
  for await (const participantId of Object.keys(workshopExecution.participants)) {
    const currentProgress = await fetchParticipantProgress(participantId, workshopExecution.id);
    if (!currentProgress) {
      const participantFirstActivityId = findParticipantFirstActivity(workshopExecution.participants, participantId);
      const newProgress = await createParticipantProgress(participantId, workshopExecution.id, participantFirstActivityId);
      await saveProgress(newProgress);
    }
  }
};

const validateAndExtractParams = (event) => {
  const { body } = extractBody(event);
  const { id: workshopExecutionId } = JSON.parse(body.Message);
  return workshopExecutionId;
};

const fetchWorkshopExecution = async (workshopExecutionId) => {
  const [workshopExecution] = await WorkshopExecutionRepository.findById(workshopExecutionId);
  if (!workshopExecution) {
    throw new ResourceNotFoundError(`WorkshopExecution not found: ${ workshopExecutionId }`);
  }
  return workshopExecution;
};

const fetchParticipantProgress = async (participantId, workshopExecutionId) => {
  const [currentProgress] = await ParticipantProgressRepository.findByParticipantIdAndWorkshopExecutionId(
      participantId, workshopExecutionId
  );
  return currentProgress;
};

const findParticipantFirstActivity = (participants, participantId) => {
  const participantEntry = Object.entries(participants).find(([key, _]) =>
      key === participantId
  );
  return participantEntry[1].activities[0];
};

const createParticipantProgress = async (participantId, workshopExecutionId, participantFirstActivityId) => {
  const activityMaxLevel = await getActivityMaxLevel(participantFirstActivityId);

  return {
    participantId,
    workshopExecutionId: workshopExecutionId,
    details: {
      stats: {
        balance: STARTING_BALANCE,
        expenses: STARTING_EXPENSES
      },
      currentActivity: {
        id: participantFirstActivityId,
        level: 1,
        maxLevel: activityMaxLevel
      },
      assets: [],
      improvements: []
    }
  };
};

const getActivityMaxLevel = async (activityId) => {
  await initializeActivities();
  return (ALL_ACTIVITIES.find(activity => activity.id === activityId)).levels;
};

const initializeActivities = async () => {
  if (arrayIsEmpty(ALL_ACTIVITIES)) {
    ALL_ACTIVITIES.push(... await ActivityRepository.findAll());
  }
};

const saveProgress = async (progress) => {
  const { entity, statement } = ParticipantProgressRepository.insertStatement(progress);
  await execOnDatabase({ statement: statement, parameters: entity });
};

const calculateMonthlyBalances = async (workshopExecutionId, elapsedTime) => {
  await messageQueue(AwsInfo.BALANCE_CALCULATOR_QUEUE, {
    workshopExecutionId,
    elapsedTime
  });
}