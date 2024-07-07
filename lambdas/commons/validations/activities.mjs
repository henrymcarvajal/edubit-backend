import { ActivitiesValidationMessages } from './messages.mjs';
import { ActivityRepository } from '../../../persistence/repositories/activityRepository.mjs';
import { DmlOperators } from '../../../persistence/dml/dmlOperators.mjs';
import { ValueValidationMessages } from '../../../commons/messages.mjs';

import { validate as uuidValidate } from 'uuid';

import { ResourceNotFoundError } from '../errors/integrity/resources.mjs';
import { InvalidInputError } from '../errors/data/input.mjs';

export const validateActivities = async (activities) => {
  for (let [index, item] of Object.keys(activities).entries()) {
    if (index !== parseInt(item)) {
      throw new InvalidInputError(ActivitiesValidationMessages.INVALID_ORDER);
    }
    if (!uuidValidate(activities[item])) {
      throw new InvalidInputError(`${ ValueValidationMessages.VALUE_IS_NOT_UUID } (activityId)}: ${ activities[item] }`);
    }
  }
  const foundActivities = await ActivityRepository.findByCriteria(
      ['id', DmlOperators.IN, activities]
  );

  const ids = Object.values(activities);
  const foundIds = foundActivities.map(activity => activity.id);

  const diff = ids.filter(id => !foundIds.includes(id));
  if (diff.length > 0) {
    throw new ResourceNotFoundError(`${ActivitiesValidationMessages.ACTIVITIES_NOT_IDENTIFIED}: ${diff}`);
  }
};