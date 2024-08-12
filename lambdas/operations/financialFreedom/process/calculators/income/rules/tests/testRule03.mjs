import { calculateMonthlyIncome } from '../incomeRules.mjs';

const ASSET_TYPE = 'TOURISM_APARTMENT';
const ASSET_VALUE = 100000;
const ASSET_UNITS = 1;

const EXPECTED_RESULT = 1200;

const playerProperties = [
  { type: ASSET_TYPE, value: ASSET_VALUE, units: ASSET_UNITS }
];

calculateMonthlyIncome(playerProperties).then(monthlyIncome => {
  console.log(monthlyIncome === EXPECTED_RESULT);
}).catch(err => {
  console.error(err);
});