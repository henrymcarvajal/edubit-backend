import { DeleteScheduleCommand } from '@aws-sdk/client-scheduler';

import { schedulerClient } from '../../../client/aws/clients/schedulerClient.mjs';
import { SchedulerMessages } from './messages.mjs';
import { WorkshopExecutionRepository } from '../../../persistence/repositories/workshopExecutionRepository.mjs';

import { execOnDatabase } from '../../../util/dbHelper.mjs';
import { getDeployedSchedulesNames, getScheduleName } from './getSchedulerList.mjs';
import { extractBody } from '../../../client/aws/utils/bodyExtractor.mjs';

const createDeleteScheduleCommandInput = (id) => {
  return {
    Name: getScheduleName(id)
  };
};

exports.handle = async (event) => {

  const { body } = extractBody(event);

  const { id } = JSON.parse(body.Message);

  try {

    const [workshopExecution] = await WorkshopExecutionRepository.findById(id);
    if (!workshopExecution) {
      console.log(`workshopExecution not found: ${ id }`);
      return;
    }

    const schedulesNames = await getDeployedSchedulesNames();

    if (schedulesNames.includes(getScheduleName(id))) {

      const deleteInput = createDeleteScheduleCommandInput(id);
      const deleteScheduleCommand = new DeleteScheduleCommand(deleteInput);
      await schedulerClient.send(deleteScheduleCommand);

      workshopExecution.endTimestamp = new Date();
      const { entity, statement } = WorkshopExecutionRepository.upsertStatement(workshopExecution);

      await execOnDatabase({ statement: statement, parameters: entity });

    } else {
      console.log(`${ SchedulerMessages.SCHEDULER_NOT_FOUND }: ${ id }`);
    }

  } catch (error) {
    console.error('Error on cleaning up scheduler', error);
  }
};