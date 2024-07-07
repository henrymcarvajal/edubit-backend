import { ActivityRepository } from '../../../persistence/repositories/activityRepository.mjs';

import { checkProps } from '../../../util/propsGetter.mjs';

import { InvalidInputError } from '../../commons/errors/data/input.mjs';

let ALL_ACTIVITIES;

export const validateWorkshopExecutionData = async (workshopExecution, props) => {
  checkProps(workshopExecution, props);

  const scheduledDate = new Date(workshopExecution.scheduledDate);
  if (scheduledDate.getTime() < new Date().getTime()) {
    throw new InvalidInputError(`scheduledDate must be in the future: ${workshopExecution.scheduledDate}`);
  }

  let values = Object.values(workshopExecution.activities);
  if (values.length === 0) {
    throw new InvalidInputError('Missing activities data');
  }

  await initializeActivities();

  const filteredActivities = filterActivities(values);
  if (filteredActivities && filteredActivities.length > 0) {
    throw new InvalidInputError(`Invalid activities ids: ${ JSON.stringify(filteredActivities) }`);
  }
};

const initializeActivities = async () => {
  const toView = (activity) => ({
    id: activity.id,
    name: activity.name
  });

  if (!ALL_ACTIVITIES) {
    ALL_ACTIVITIES = (await ActivityRepository.findAll()).map(toView);
  }
};

const filterActivities = (activities) => {
  return activities.filter(o1 => !ALL_ACTIVITIES.some(o2 => o1 === o2.id));
};

