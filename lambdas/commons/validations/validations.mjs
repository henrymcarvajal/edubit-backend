import { ActivitiesValidationMessages } from './messages.mjs';
import { ActivityRepository } from '../../../persistence/repositories/activityRepository.mjs';
import { DmlOperators } from '../../../persistence/dml/dmlOperators.mjs';

import { ActivitiesNotFoundError, InvalidActivitiesFormatError } from './error.mjs';

export const validateActivities = async (activities) => {
  for (let [index, item] of Object.keys(activities).entries()) {
    if (index !== parseInt(item)) {
      throw new InvalidActivitiesFormatError(ActivitiesValidationMessages.INVALID_ORDER);
    }
  }
  const foundActivities = await ActivityRepository.findByCriteria(
      ['id', DmlOperators.IN, activities]
  );

  const ids = Object.values(activities);
  const foundIds = foundActivities.map(activity => activity.id);

  const diff = ids.filter(id => !foundIds.includes(id));
  if (diff.length > 0) {
    throw new ActivitiesNotFoundError(`${ActivitiesValidationMessages.ACTIVITIES_NOT_IDENTIFIED}: ${diff}`);
  }
};