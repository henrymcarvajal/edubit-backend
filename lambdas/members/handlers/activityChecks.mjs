import { ActivitiesValidationMessages } from '../../commons/validations/messages.mjs';

import { ActivitiesNotFoundError } from '../../commons/validations/error.mjs';

export const crossCheckActivities = (sourceActivities, targetActivities) => {
  const diff = sourceActivities.filter(id => !targetActivities.includes(id));
  if (diff.length > 0) {
    throw new ActivitiesNotFoundError(`${ActivitiesValidationMessages.ACTIVITIES_NOT_IDENTIFIED}: ${diff}`);
  }
};