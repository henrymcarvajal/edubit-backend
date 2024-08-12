import { PurchasesMessages } from '../messages/purchasesMessages.mjs';

import { totalAssetsPayment } from './financialSources.mjs';

import { ResourceStateError } from '../../../../commons/errors/integrity/resources.mjs';

const purchaseWithFunds = (progresses, purchase) => {
  const costTotal = totalAssetsPayment(purchase.assets);
  const averagedCostTotal = costTotal / progresses.length;

  const balanceBelowAveragedCost = checkBalancesAgainstAveragedCost(progresses, averagedCostTotal);
  if (balanceBelowAveragedCost) {
    throw new ResourceStateError(PurchasesMessages.NOT_ENOUGH_FUNDS(balanceBelowAveragedCost.details.stats.balance));
  }
  return costTotal;
};

export const checkBalancesAgainstAveragedCost = (progresses, averagedCost) => progresses.find((progress) => progress.details.stats.balance < averagedCost);


export default purchaseWithFunds;