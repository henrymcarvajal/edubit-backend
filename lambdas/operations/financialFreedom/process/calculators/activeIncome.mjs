import { getWageByActivityLevels } from './getWageByActivityAndLevel.mjs';

export const calculateMonthlyActiveIncome = async (details) => {
  const currentActivity = details.currentActivity;
  const improvementRate = details.stats.currentImprovementRate || 0;
  const rawIncomeByActivity = await getWageByActivityLevels(currentActivity.maxLevel, currentActivity.level);
  return (1 + improvementRate) * rawIncomeByActivity;
};