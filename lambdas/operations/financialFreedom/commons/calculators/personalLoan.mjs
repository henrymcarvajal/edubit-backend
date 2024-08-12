import { PurchasesMessages } from '../messages/purchasesMessages.mjs';
import {
  calculateIncomeTotal,
  calculateInstallmentsTotal,
  calculateMonthlyInstallment,
  getAverageInstallment,
  LOANS_TERMS
} from '../loans.mjs';
import { FINANCIAL_SOURCES_OPTIONS, registerLoan, totalAssetsPayment } from './financialSources.mjs';

import { roundTwoDecimalPositions } from '../../../../../util/numbers.mjs';

import { InvalidInputError } from '../../../../commons/errors/data/input.mjs';
import { ResourceStateError } from '../../../../commons/errors/integrity/resources.mjs';

const purchaseWithPersonalLoan = (progresses, purchase) => {
  checkNoAssetsAreMortgageable(purchase.assets);

  const principal = totalAssetsPayment(purchase.assets);

  const {
    PERSONAL_LOAN: {
      INTEREST_RATE: rate, DOWN_PAYMENT_PERCENTAGE: downPaymentPercentage
    }
  } = LOANS_TERMS;

  const averageDownPayment = checkAverageDownPayment(progresses, purchase.assets, downPaymentPercentage);

  const installment = getAverageInstallment(progresses.length, principal, rate, purchase.installments);

  registerLoan(progresses, purchase, rate, installment, FINANCIAL_SOURCES_OPTIONS.PERSONAL_LOAN);

  return averageDownPayment;
};

const checkNoAssetsAreMortgageable = (assets) => {
  if (!assets.every(asset => !asset.mortgageable)) {
    throw new InvalidInputError(PurchasesMessages.ALL_ASSETS_MUST_BE_NON_MORTGAGEABLE);
  }
};

const checkAverageDownPayment = (progresses, assets, downPaymentPercentage) => {
  const averageDownPayment = calculateAverageDownPayment(progresses, assets, downPaymentPercentage);
  const balanceBelowAveragedDownPayment = findBalanceBelowAverageDownPayment(progresses, averageDownPayment);
  if (balanceBelowAveragedDownPayment) {
    throw new ResourceStateError(PurchasesMessages.NOT_ENOUGH_DOWN_PAYMENT_FOR_MORTGAGE(averageDownPayment, balanceBelowAveragedDownPayment.details.stats.balance));
  }
  return averageDownPayment;
};

const calculateAverageDownPayment = (progresses, assets, downPaymentPercentage) => {
  const downPayment = roundTwoDecimalPositions(downPaymentPercentage * totalAssetsPayment(assets));
  return roundTwoDecimalPositions(downPayment / progresses.length);
};

const findBalanceBelowAverageDownPayment = (progresses, averagedDownPayment) => progresses.find((progress) => progress.details.stats.balance < averagedDownPayment);

const checkAverageInstallment = (progresses, principal, rate, installments) => {
  const installment = calculateMonthlyInstallment(principal, rate, installments);
  const incomeBelowAverageInstallment = findIncomeBelowAverageInstallment(progresses, installment);
  if (incomeBelowAverageInstallment) {
    const totalIncome = incomeBelowAverageInstallment.details.stats.activeIncome + incomeBelowAverageInstallment.details.stats.passiveIncome;
    throw new ResourceStateError(PurchasesMessages.NOT_ENOUGH_INCOME_FOR_INSTALLMENT(installment, totalIncome));
  }
  return installment / progresses.length;
};

const findIncomeBelowAverageInstallment = (progresses, averageInstallment) =>
    progresses.find((progress) => {

      const totalInstallments = calculateInstallmentsTotal(progress.details);
      const totalIncome = calculateIncomeTotal(progress);

      return (totalIncome - totalInstallments) < averageInstallment;
    });

export default purchaseWithPersonalLoan;