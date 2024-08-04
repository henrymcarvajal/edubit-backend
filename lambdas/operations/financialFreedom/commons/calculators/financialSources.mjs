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
  const averagedCostTotal = costTotal / progresses.length;

  const balanceBelowAveragedCost = checkBalancesAgainstAveragedCost(progresses, averagedCostTotal);
  if (balanceBelowAveragedCost) {
    throw new ResourceStateError(PurchasesMessages.NOT_ENOUGH_FUNDS(balanceBelowAveragedCost.details.stats.balance));
  }
  return costTotal;
};

const purchaseWithMortgage = (progresses, foundAssets, buyer) => {
  if (!foundAssets.every(asset => asset.mortgageable)) {
    throw new InvalidInputError(PurchasesMessages.ALL_ASSETS_MUST_BE_MORTGAGEABLE);
  }

  const maxLoanAmount = roundTwoDecimalPositions(
      progresses.reduce((total, progress) => total + (progress.details.stats.balance / progresses.length), 0));

  const totalLoanAmount = roundTwoDecimalPositions(LOAN_FACTORS.MORTGAGE.ASSET_VALUE * totalAssetsCost(foundAssets));
  if (maxLoanAmount < totalLoanAmount) {
    throw new ResourceStateError(PurchasesMessages.NOT_ENOUGH_FOR_MORTGAGE(maxLoanAmount, totalLoanAmount));
  }

  const balancesTotal = totalBalances(progresses);
  const minimumBalanceForLoanAmount = roundTwoDecimalPositions((1 - LOAN_FACTORS.MORTGAGE.ASSET_VALUE) * totalAssetsCost(foundAssets));
  if (balancesTotal < minimumBalanceForLoanAmount) {
    throw new ResourceStateError(PurchasesMessages);
  }

  registerLoan(progresses, foundAssets, LOAN_FACTORS.MORTGAGE.ASSET_VALUE, INTEREST_RATE.MORTGAGE, buyer);

  return minimumBalanceForLoanAmount;
};

const purchaseWithFreeInvestment = (progresses, foundAssets) => {
  if (!foundAssets.every(asset => !asset.mortgageable)) {
    throw new InvalidInputError(PurchasesMessages.ALL_ASSETS_MUST_BE_NON_MORTGAGEABLE);
  }

  const maxLoanAmount = LOAN_FACTORS.FREE_INVESTMENT.BALANCE * totalBalances(progresses);
  const totalLoanAmount = roundTwoDecimalPositions(LOAN_FACTORS.FREE_INVESTMENT.ASSET_VALUE * totalAssetsCost(foundAssets));
  if (maxLoanAmount < totalLoanAmount) {
    throw new ResourceStateError(PurchasesMessages.NOT_ENOUGH_FOR_FREE_INVESTMENT(maxLoanAmount, totalLoanAmount));
  }

  const minimumBalanceForLoanAmount = roundTwoDecimalPositions((1 - LOAN_FACTORS.FREE_INVESTMENT.ASSET_VALUE) * totalAssetsCost(foundAssets));
  if (progresses.details.stats.balance < minimumBalanceForLoanAmount) {
    throw new ResourceStateError(PurchasesMessages);
  }

  registerLoan(progresses, foundAssets, LOAN_FACTORS.FREE_INVESTMENT.ASSET_VALUE, INTEREST_RATE.FREE_INVESTMENT);

  return minimumBalanceForLoanAmount;
};

export const totalBalances = (progresses) => progresses.reduce((accumulator, progress) => accumulator + progress.details.stats.balance, 0);

export const checkBalancesAgainstAveragedCost = (progresses, averagedCost) => progresses.find((progress) => progress.details.stats.balance < averagedCost);

export const totalAssetsCost = (assets) => assets.reduce((accumulator, asset) => accumulator + asset.price, 0);

export const roundToNDecimalPositions = (decimal, positions) => parseFloat(decimal.toFixed(positions));

export const roundTwoDecimalPositions = (decimal) => roundToNDecimalPositions(decimal, 2);

export const FINANCIAL_SOURCES_OPTIONS = {
  FREE_INVESTMENT: purchaseWithFreeInvestment,
  FUNDS: purchaseWithFunds,
  MORTGAGE: purchaseWithMortgage
};

const registerLoan = (progresses, foundAssets, loanFactor, interestRate) => {
  for (const progress of progresses) {
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

  }
};