import { BUYER_OPTIONS } from '../constants.mjs';

import purchaseWithMortgage from './mortgage.mjs';
import purchaseWithFunds from './funds.mjs';
import purchaseWithPersonalLoan from './personalLoan.mjs';

export const totalAssetsPayment = (assets) => assets.reduce((totalPayment, asset) => totalPayment + asset.price, 0);

export const FINANCIAL_SOURCES_OPTIONS = {
  PERSONAL_LOAN: 'PERSONAL_LOAN',
  FUNDS: 'FUNDS',
  MORTGAGE: 'MORTGAGE'
}

export const FINANCIAL_SOURCES_STRATEGIES = {
  [FINANCIAL_SOURCES_OPTIONS.PERSONAL_LOAN]: purchaseWithPersonalLoan,
  [FINANCIAL_SOURCES_OPTIONS.FUNDS]: purchaseWithFunds,
  [FINANCIAL_SOURCES_OPTIONS.MORTGAGE]: purchaseWithMortgage
};

export const registerLoan = (progresses, purchase, rate, installment, source) => {
  for (const progress of progresses) {
    let loans;
    if (purchase.buyer === BUYER_OPTIONS.PARTICIPANT) {
      if (!progress.details.loans) {
        progress.details.loans = [];
      }
      loans = progress.details.loans;
    } else {
      if (!progress.details.partnership.loans) {
        progress.details.partnership.loans = [];
      }
      loans = progress.details.partnership.loans;
    }

    purchase.assets.forEach(asset => {
      const mortgage = {
        assetId: asset.id,
        source,
        installment,
        rate,
        installments: purchase.installments
      };

      loans.push(mortgage);
    });
  }
};