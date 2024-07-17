import { calculatePassiveIncome } from './rules/passiveIncomeRules.mjs';

export const calculateMonthlyPassiveIncome = async (assets, elapsedTime) => {
  try {
    return await calculatePassiveIncome(assets, elapsedTime);
  } catch (error) {
    console.log(error);
  }
};