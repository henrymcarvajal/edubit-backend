import { PurchasesMessages } from '../messages/purchasesMessages.mjs';

import { InvalidInputError } from '../../../../commons/errors/data/input.mjs';
import { ResourceStateError } from '../../../../commons/errors/integrity/resources.mjs';
import { BUYER_OPTIONS } from '../constants.mjs';

const INTEREST_RATE = {
  MORTGAGE: 0.04,
  FREE_INVESTMENT: 0.07
};

const LOAN_FACTORS = {
  MORTGAGE: {
    BALANCE: 15,
    ASSET_VALUE: 0.9
  },
  FREE_INVESTMENT: {
    BALANCE: 8,
    ASSET_VALUE: 1
  }
};

const purchaseWithFunds = (progresses, foundAssets) => {
  const costTotal = totalAssetsCost(foundAssets);
  const balancesTotal = totalBalances(progresses);
  if (costTotal > balancesTotal) {
    throw new ResourceStateError(PurchasesMessages.NOT_ENOUGH_FUNDS);
  }

  console.log('purchaseWithFunds');
  return costTotal;
};

const purchaseWithMortgage = (progresses, foundAssets, buyer) => {
  if (!foundAssets.every(asset => asset.mortgageable)) {
    throw new InvalidInputError(PurchasesMessages.ALL_ASSETS_MUST_BE_MORTGAGEABLE);
  }

  const participationFactor = buyer === BUYER_OPTIONS.PARTICIPANT ? 1.0 : 0.5;

  const maxLoanAmount = progresses.reduce((a, progress) => a + (participationFactor * progress.details.stats.balance), 0);
  console.log('maxLoanAmount', maxLoanAmount)

  const totalLoanAmount = roundTwoDecimalPositions(LOAN_FACTORS.MORTGAGE.ASSET_VALUE * totalAssetsCost(foundAssets));
  if (maxLoanAmount < totalLoanAmount) {
    throw new ResourceStateError(PurchasesMessages.NOT_ENOUGH_FOR_MORTGAGE(maxLoanAmount, totalLoanAmount));
  }

  const minimumBalanceForLoanAmount = roundTwoDecimalPositions((1 - LOAN_FACTORS.MORTGAGE.ASSET_VALUE) * totalAssetsCost(foundAssets));
  if (progress.details.stats.balance < minimumBalanceForLoanAmount) {
    throw new ResourceStateError(PurchasesMessages);
  }

  registerLoan(progress, foundAssets, LOAN_FACTORS.MORTGAGE.ASSET_VALUE, INTEREST_RATE.MORTGAGE, buyer);

  console.log('purchaseWithMortgage');
  return minimumBalanceForLoanAmount;
};

const purchaseWithFreeInvestment = (progresses, foundAssets) => {
  if (!foundAssets.every(asset => !asset.mortgageable)) {
    throw new InvalidInputError(PurchasesMessages.ALL_ASSETS_MUST_BE_NON_MORTGAGEABLE);
  }

  const maxLoanAmount = LOAN_FACTORS.FREE_INVESTMENT.BALANCE * totalBalances(progresses);//.details.stats.balance;
  const totalLoanAmount = roundTwoDecimalPositions(LOAN_FACTORS.FREE_INVESTMENT.ASSET_VALUE * totalAssetsCost(foundAssets));
  if (maxLoanAmount < totalLoanAmount) {
    throw new ResourceStateError(PurchasesMessages.NOT_ENOUGH_FOR_FREE_INVESTMENT(maxLoanAmount, totalLoanAmount));
  }

  const minimumBalanceForLoanAmount = roundTwoDecimalPositions((1 - LOAN_FACTORS.FREE_INVESTMENT.ASSET_VALUE) * totalAssetsCost(foundAssets));
  if (progresses.details.stats.balance < minimumBalanceForLoanAmount) {
    throw new ResourceStateError(PurchasesMessages);
  }

  registerLoan(progresses, foundAssets, LOAN_FACTORS.FREE_INVESTMENT.ASSET_VALUE, INTEREST_RATE.FREE_INVESTMENT);

  console.log('purchaseWithFreeInvestment');
  return minimumBalanceForLoanAmount;
};

export const totalBalances = (progresses) => progresses.reduce((accumulator, progress) => accumulator + progress.details.stats.balance, 0);

export const totalAssetsCost = (assets) => assets.reduce((accumulator, asset) => accumulator + asset.price, 0);

export const roundToNDecimalPositions = (decimal, positions) => parseFloat(decimal.toFixed(positions));

export const roundTwoDecimalPositions = (decimal) => roundToNDecimalPositions(decimal, 2);

export const FINANCIAL_SOURCES_OPTIONS = {
  FREE_INVESTMENT: purchaseWithFreeInvestment,
  FUNDS: purchaseWithFunds,
  MORTGAGE: purchaseWithMortgage
};

const registerLoan = (progress, foundAssets, loanFactor, interestRate) => {
  if (!progress.details.loans) {
    progress.details.loans = [];
  }

  foundAssets.forEach(asset => {

    const mortgage = {
      assetId: asset.id,
      amount: roundTwoDecimalPositions(loanFactor * asset.price),
      rate: interestRate
    };

    progress.details.loans.push(mortgage);
  });


  console.log('registerLoan');
};