import { FINANCIAL_SOURCES_OPTIONS } from './financialSources.mjs';

const makePurchase = (progresses, foundAssets, source, buyer) => {
  let financialSource =  source || 'FUNDS';

  console.log('processAssets')
  return FINANCIAL_SOURCES_OPTIONS[financialSource](progresses, foundAssets, buyer);
};

export default makePurchase;