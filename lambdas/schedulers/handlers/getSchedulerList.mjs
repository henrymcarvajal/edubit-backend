import { schedulerClient } from '../../../client/aws/clients/schedulerClient.mjs';

import { ListSchedulesCommand } from '@aws-sdk/client-scheduler';

const createListSchedulesCommandInput = () => {
  return {
    GroupName: `default`
  };
};

export const getScheduleName = (id) => {
  return `edubit-timer-workshop-${id}`;
};

export const getDeployedSchedulesNames = async () => {

  const listInput = createListSchedulesCommandInput();
  const listCommand = new ListSchedulesCommand(listInput);
  const listResponse = await schedulerClient.send(listCommand);

  return listResponse.Schedules ? listResponse.Schedules.map(s => s.Name) : [];
}