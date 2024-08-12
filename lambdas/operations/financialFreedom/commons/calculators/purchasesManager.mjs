import { FINANCIAL_SOURCES_OPTIONS, FINANCIAL_SOURCES_STRATEGIES } from './financialSources.mjs';

const makePurchase = (progresses, purchase) => {
  purchase.source =  purchase.source || FINANCIAL_SOURCES_OPTIONS.FUNDS;

  const strategy = FINANCIAL_SOURCES_STRATEGIES[FINANCIAL_SOURCES_OPTIONS[purchase.source]];
  return strategy(progresses, purchase);
};

export default makePurchase;