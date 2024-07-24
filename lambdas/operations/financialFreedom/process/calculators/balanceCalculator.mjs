import {
  ParticipantProgressRepository
} from '../../../../../persistence/repositories/participantProgressRepository.mjs';

import { execOnDatabase } from '../../../../../util/dbHelper.mjs';
import { extractBody } from '../../../../../client/aws/utils/bodyExtractor.mjs';
import { calculateMonthlyActiveIncome } from './income/activeIncome.mjs';
import { calculateMonthlyPassiveIncome } from './income/passiveIncome.mjs';
import { calculateMonthlyExpenses } from './expenses/expenses.mjs';

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
    console.log('activeIncome', activeIncome);
    const passiveIncome = await calculateMonthlyPassiveIncome(progress.details.assets, elapsedTime);
    console.log('passiveIncome', passiveIncome);

    const expenses = await calculateMonthlyExpenses(progress.details.assets, elapsedTime);
    console.log('expenses', expenses);

    const totalRawIncome = (activeIncome || 0) + (passiveIncome || 0);
    const totalRawExpenses = (expenses || 0);
    console.log('totalNetIncome', totalRawIncome);

    updateBalance(progress.details, totalRawIncome, totalRawExpenses);
    await saveParticipantProgress(progress);
  }
};

const updateBalance = (details, totalRawIncome, totalRawExpenses) => {
  if (!details.history) {
    details.history = [];
  }

  const final = details.stats.balance + (totalRawIncome + totalRawExpenses);
  details.history.push({
    income: totalRawIncome,
    expenses: totalRawExpenses,
    initial: details.stats.balance,
    final: final,
  });
  details.stats.balance = final;
};

const saveParticipantProgress = async (progress) => {
  const { entity, statement } = ParticipantProgressRepository.upsertStatement(progress);
  await execOnDatabase({ statement: statement, parameters: entity });
};