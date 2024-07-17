import {
  ParticipantProgressRepository
} from '../../../../../persistence/repositories/participantProgressRepository.mjs';

import { execOnDatabase } from '../../../../../util/dbHelper.mjs';
import { extractBody } from '../../../../../client/aws/utils/bodyExtractor.mjs';
import { calculateMonthlyActiveIncome } from './activeIncome.mjs';
import { calculateMonthlyPassiveIncome } from './passiveIncome.mjs';
import { calculateMonthlyExpenses } from './expenses.mjs';

export const handle = async (event) => {
  try {
    const { workshopExecutionId, elapsedTime } = validateAndExtractParams(event);
    await calculateMonthlyBalances(workshopExecutionId, elapsedTime);
  } catch (error) {
    console.log(error);
  }
};

const validateAndExtractParams = (event) => {
  const { body } = extractBody(event);
  const { workshopExecutionId, elapsedTime } = body;
  return { workshopExecutionId, elapsedTime };
};

const calculateMonthlyBalances = async (workshopExecutionId, elapsedTime) => {
  const progresses = await ParticipantProgressRepository.findByWorkshopExecutionId(workshopExecutionId);

  for await (const progress of progresses) {
    const activeIncome = await calculateMonthlyActiveIncome(progress.details);
    const passiveIncome = await calculateMonthlyPassiveIncome(progress.details.assets, elapsedTime);

    const expenses = await calculateMonthlyExpenses(progress.details.assets, elapsedTime);

    const totalIncome = (activeIncome || 0) + (passiveIncome || 0) - (expenses || 0);
    if (totalIncome) {
      updateBalance(progress.details, totalIncome);
      await saveParticipantProgress(progress);
    }
  }
};

const updateBalance = (details, income) => {
  if (!details.history) {
    details.history = [];
  }
  details.history.push(details.stats.balance);
  details.stats.balance += income;
};

const saveParticipantProgress = async (progress) => {
  const { entity, statement } = ParticipantProgressRepository.upsertStatement(progress);
  await execOnDatabase({ statement: statement, parameters: entity });
};