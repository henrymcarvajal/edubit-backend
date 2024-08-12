import { calculateMonthlyIncome } from '../incomeRules.mjs';

const ASSET_1_TYPE = 'URBAN_LAND_LOT';
const ASSET_1_VALUE = 100000;
const ASSET_1_UNITS = 1;
const ASSET_2_TYPE = 'HOUSE_ON_URBAN_LAND_LOT';
const ASSET_2_VALUE = 100000;
const ASSET_2_UNITS = 2;

const EXPECTED_RESULT = 2400;

const playerProperties = [
  { type: ASSET_1_TYPE, value: ASSET_1_VALUE, units: ASSET_1_UNITS },
  { type: ASSET_2_TYPE, value: ASSET_2_VALUE, units: ASSET_2_UNITS },
];

calculateMonthlyIncome(playerProperties).then(monthlyIncome => {
  console.log(monthlyIncome === EXPECTED_RESULT);
}).catch(err => {
  console.error(err);
});