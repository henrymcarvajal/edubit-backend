import { schedulerClient } from '../../../client/aws/clients/schedulerClient.mjs';

import { ListSchedulesCommand } from '@aws-sdk/client-scheduler';

const SCHEDULER_NAME_PREFIX = 'edubit-timer-workshop-';

export const createListSchedulesCommandInput = () => {
  return {
    GroupName: `default`
  };
};

export const getScheduleName = (id) => {
  return `${SCHEDULER_NAME_PREFIX}${id}`;
};

export const getScheduleId = (name) => {
  return name.replace(SCHEDULER_NAME_PREFIX, '');
};

export const getDeployedSchedulesNames = async () => {

  const listInput = createListSchedulesCommandInput();
  const listCommand = new ListSchedulesCommand(listInput);
  const listResponse = await schedulerClient.send(listCommand);

  return listResponse.Schedules ? listResponse.Schedules.map(s => s.Name) : [];
}