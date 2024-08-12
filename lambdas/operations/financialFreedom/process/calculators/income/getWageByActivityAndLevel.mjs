import WagesRepository from '../../../../../../persistence/repositories/wageRepository.mjs';

import { arrayIsEmpty } from '../../../../../../util/arrays.mjs';

const ALL_WAGES = [];

export const getWageByActivityLevels = async (activityLevels, currentLevel) => {
  await initializeWages();
  const wage = ALL_WAGES.find(wage => wage.maxLevels === activityLevels);
  return wage[`level${ currentLevel }`];
};

const initializeWages = async () => {
  if (arrayIsEmpty(!ALL_WAGES)) {
    ALL_WAGES.push(... await WagesRepository.findAll());
  }
};

