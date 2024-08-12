import ParticipantProgressRepository from '../../../../../persistence/repositories/participantProgressRepository.mjs';
import WorkshopExecutionRepository from '../../../../../persistence/repositories/workshopExecutionRepository.mjs';
import { LOANS_TERMS } from '../../commons/loans.mjs';
import { PLAYER_STATE } from '../../commons/constants.mjs';

import { execOnDatabase } from '../../../../../util/dbHelper.mjs';
import { extractBody } from '../../../../../client/aws/utils/bodyExtractor.mjs';
import { calculateMonthlyActiveIncome } from './income/activeIncome.mjs';
import { calculateMonthlyPassiveIncome } from './income/passiveIncome.mjs';
import { calculateMonthlyExpenses } from './expenses/expenses.mjs';
import { roundTwoDecimalPositions } from '../../../../../util/numbers.mjs';
import { calculateTiming } from './../../../../workshops/handlers/execution/calculateWorkshopTiming.mjs';
import { PHASE_TYPE } from '../../commons/activityType.mjs';
import ActivityRepository from '../../../../../persistence/repositories/activityRepository.mjs';

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

  const [workshopExecution] = await WorkshopExecutionRepository.findFullViewById(workshopExecutionId);

  const timing = calculateTiming(workshopExecution);

  for await (const progress of progresses) {

    progress.details.currentActivity = await updateCurrentActivity(workshopExecution.participants, progress, timing.currentPhase);

    const activeIncome = await calculateMonthlyActiveIncome(progress.details, timing);
    const passiveIncome = await calculateMonthlyPassiveIncome(progress.details, elapsedTime);
    const expenses = await calculateMonthlyExpenses(progress.details, elapsedTime);

    updateBalance(progress.details, activeIncome, passiveIncome, expenses);
    calculateBorrowingPower(progress.details.stats);

    progress.details.state = verifyDisqualification(progress.details.history);

    await saveParticipantProgress(progress);
  }
};

const updateBalance = (details, activeIncome, passiveIncome, expenses) => {
  if (!details.history) {
    details.history = {};
    details.history.balance = [];
  }

  const totalRawIncome = (activeIncome || 0) + (passiveIncome || 0);
  const totalRawExpenses = (expenses || 0);
  const finalBalance = details.stats.balance + (totalRawIncome + totalRawExpenses);

  /*details.history.push({
    income: totalRawIncome,
    expenses: totalRawExpenses,
    initialBalance: details.stats.balance,
    finalBalance: finalBalance,
  });*/
  details.history.balance.push(finalBalance);
  details.stats.balance = finalBalance;
  details.stats.activeIncome = activeIncome;
  details.stats.passiveIncome = passiveIncome;
  details.stats.expenses = expenses;
};

const updateCurrentActivity = async (participants, progress, currentPhase) => {
  if (currentPhase.type === PHASE_TYPE.ACTIVITY) {
    if (!progress.details.currentActivity) {

      const participantKey = Object.keys(participants).find(p => p === progress.participantId);
      const activities = participants[participantKey].activities;
      const activityId = activities[currentPhase.sequence];
      const [activity] = await ActivityRepository.findById(activityId);

      return {
        id: activityId,
        level: 1,
        maxLevel: activity.levels
      };
    } else {
      return progress.details.currentActivity;
    }
  }
};

const calculateBorrowingPower = (stats) => {
  if (!stats.borrowingPower) {
    stats.borrowingPower = {};
  }
  if (stats.balance > 0) {
    stats.borrowingPower.mortgage =
        roundTwoDecimalPositions(LOANS_TERMS.MORTGAGE.BALANCE_MULTIPLIER * stats.balance);
    stats.borrowingPower.personalLoan =
        roundTwoDecimalPositions(LOANS_TERMS.PERSONAL_LOAN.BALANCE_MULTIPLIER * stats.balance);
    stats.borrowingPower.ratio =
        roundTwoDecimalPositions(-stats.expenses / (stats.activeIncome + stats.passiveIncome) * 100);
  } else {
    stats.borrowingPower.mortgage = 0;
    stats.borrowingPower.personalLoan = 0;
    stats.borrowingPower.ratio = 0;
  }
};

const verifyDisqualification = (history) => {
  if (history?.balance?.length > 3) {
    let isDisqualified = true;
    for (let i = 0; i < 3; ++i) {
      isDisqualified = isDisqualified && history.balance[history.balance.length - 1 - i] < 0;
    }
    if (isDisqualified) {
      return PLAYER_STATE.DISQUALIFIED;
    }
  }
  return PLAYER_STATE.ENABLED;
};

const saveParticipantProgress = async (progress) => {
  const { entity, statement } = ParticipantProgressRepository.upsertStatement(progress);
  await execOnDatabase({ statement: statement, parameters: entity });
};