import ParticipantProgressRepository from '../../../../../persistence/repositories/participantProgressRepository.mjs';

import { execOnDatabase } from '../../../../../util/dbHelper.mjs';
import { extractBody } from '../../../../../client/aws/utils/bodyExtractor.mjs';
import { calculateMonthlyActiveIncome } from './income/activeIncome.mjs';
import { calculateMonthlyPassiveIncome } from './income/passiveIncome.mjs';
import { calculateMonthlyExpenses } from './expenses/expenses.mjs';

exports.handle = async (event) => {
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

    updateBalance(progress.details, activeIncome, passiveIncome, expenses);
    calculateBorrowingPower(progress.details);

    await saveParticipantProgress(progress);
  }
};

const updateBalance = (details, activeIncome, passiveIncome, expenses) => {
  if (!details.history) {
    details.history = [];
  }

  const totalRawIncome = (activeIncome || 0) + (passiveIncome || 0);
  const totalRawExpenses = (expenses || 0);
  const finalBalance = details.stats.balance + (totalRawIncome + totalRawExpenses);

  details.history.push({
    income: totalRawIncome,
    expenses: totalRawExpenses,
    initialBalance: details.stats.balance,
    finalBalance: finalBalance,
  });
  details.stats.balance = finalBalance;
  details.stats.activeIncome = activeIncome;
  details.stats.passiveIncome = passiveIncome;
};

const calculateBorrowingPower = (details) => {
  if (!details.stats.borrowingPower) {
    details.stats.borrowingPower = {};
  }

  details.stats.borrowingPower.mortgage = details.stats.balance + details.stats.activeIncome + details.stats.passiveIncome;
  details.stats.borrowingPower.freeInvestment = 123123;
};

const saveParticipantProgress = async (progress) => {
  const { entity, statement } = ParticipantProgressRepository.upsertStatement(progress);
  await execOnDatabase({ statement: statement, parameters: entity });
};