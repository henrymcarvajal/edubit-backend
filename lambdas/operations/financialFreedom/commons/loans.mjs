import { roundToNDecimalPositions, roundTwoDecimalPositions } from '../../../../util/numbers.mjs';

export const LOANS_TERMS = {
  MORTGAGE: {
    INTEREST_RATE: 0.009,
    BALANCE_MULTIPLIER: 15,
    DOWN_PAYMENT_PERCENTAGE: 0.1,
    MAX_INSTALLMENTS: 360

  },
  PERSONAL_LOAN: {
    INTEREST_RATE: 0.015,
    BALANCE_MULTIPLIER: 8,
    DOWN_PAYMENT_PERCENTAGE: 0,
    MAX_INSTALLMENTS: 96
  }
};

export const calculateMonthlyInstallment = (principal, rate, installments) => {
  const totalInterest = (1 + rate) ** installments;
  const installment = rate * totalInterest * principal / (totalInterest - 1);
  return roundToNDecimalPositions(installment, 0);
};

export const calculateInstallmentsTotal = (details) =>
    calculateAverageLoanInstallmentsTotal(details.loans, 1) +
    calculateAverageLoanInstallmentsTotal(details.partnership?.loans, 0.5);

export const calculateAverageLoanInstallmentsTotal = (loans, factor) => {
  if (loans) {
    return roundTwoDecimalPositions(loans.reduce((total, loan) => total + (factor * loan.installment), 0));
  }
  return 0;
};

export const calculateIncomeTotal = (progress) =>
    progress.details.stats.activeIncome + progress.details.stats.passiveIncome;

export const getAverageInstallment = (participants, principal, rate, installments) => {
  const installment = calculateMonthlyInstallment(principal, rate, installments);
  return installment / participants;
};
