import { calculateInstallmentsTotal } from '../../../commons/loans.mjs';

const DEFAULT_MONTHLY_EXPENSES = -3000000;

export const calculateMonthlyExpenses = async (details, elapsedTime) => {
  const installments = calculateInstallmentsTotal(details);
  return DEFAULT_MONTHLY_EXPENSES - installments;
};


