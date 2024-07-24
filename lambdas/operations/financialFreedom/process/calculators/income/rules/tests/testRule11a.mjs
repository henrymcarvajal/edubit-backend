import { calculateMonthlyIncome } from '../incomeRules.mjs';

const ASSET_TYPE = 'FRANCHISE';
const ASSET_VALUE = 100000;
const ASSET_UNITS = 1;
const ELAPSED_TIME = 24;

const EXPECTED_RESULT = 0;

const playerProperties = [
  { type: ASSET_TYPE, value: ASSET_VALUE, units: ASSET_UNITS }
];

calculateMonthlyIncome(playerProperties, ELAPSED_TIME).then(monthlyIncome => {
  console.log(monthlyIncome === EXPECTED_RESULT);
}).catch(err => {
  console.error(err);
});