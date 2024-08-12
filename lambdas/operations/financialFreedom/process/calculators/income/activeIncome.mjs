import { getWageByActivityLevels } from './getWageByActivityAndLevel.mjs';
import { PHASE_TYPE } from '../../../commons/activityType.mjs';

export const calculateMonthlyActiveIncome = async (details, timing) => {
  if (timing.currentPhase.type === PHASE_TYPE.ACTIVITY) {
    const { currentActivity } = details;
    const currentImprovementRate = details.stats.currentImprovementRate || 0;
    const rawIncomeByActivity = await getWageByActivityLevels(currentActivity.maxLevel, currentActivity.level);
    return (1 + currentImprovementRate) * rawIncomeByActivity;
  }
  return 0;
};