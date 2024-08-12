import { ActivitiesValidationMessages } from '../../commons/validations/messages.mjs';
import { ResourceNotFoundError } from '../../commons/errors/integrity/resources.mjs';

export const crossCheckActivities = (sourceActivities, targetActivities) => {
  const diff = sourceActivities.filter(id => !targetActivities.includes(id));
  if (diff.length > 0) {
    throw new ResourceNotFoundError(`${ActivitiesValidationMessages.ACTIVITIES_NOT_IDENTIFIED}: ${diff}`);
  }
};