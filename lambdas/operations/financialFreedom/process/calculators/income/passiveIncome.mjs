import { calculatePassiveIncome } from './rules/passiveIncomeRules.mjs';
import { roundTwoDecimalPositions } from '../../../../../../util/numbers.mjs';

export const calculateMonthlyPassiveIncome = async (details, elapsedTime) => {
  try {
    const ownPassiveIncome = await calculatePassiveIncome(details.assets, elapsedTime);
    const partnershipPassiveIncome = roundTwoDecimalPositions( await calculatePassiveIncome(details.partnership?.assets, elapsedTime) * 0.5);
    return ownPassiveIncome + partnershipPassiveIncome
  } catch (error) {
    console.log(error);
  }
};