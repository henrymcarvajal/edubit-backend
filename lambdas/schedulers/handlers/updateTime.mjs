import { AwsInfo } from '../../../client/aws/AwsInfo.mjs';
import { WorkshopExecutionRepository } from '../../../persistence/repositories/workshopExecutionRepository.mjs';

import { extractBody } from '../../../client/aws/utils/bodyExtractor.mjs';
import { execOnDatabase } from '../../../util/dbHelper.mjs';
import { publishMessageToTopic } from '../../../client/aws/clients/snsClient.mjs';

exports.handle = async (event) => {

  const { body } = extractBody(event);

  try {
    const [workshopExecution] = await WorkshopExecutionRepository.findById(body.id);

    if (workshopExecution) {

      if (!workshopExecution.remainingTime) {
        await publishMessageToTopic(AwsInfo.TIMER_NOTIFICATION_TOPIC_ARN, { id: workshopExecution.id }, { topic: AwsInfo.CLEAN_SCHEDULER_TOPIC_NAME });
        return;
      }

      workshopExecution.remainingTime--;
      workshopExecution.elapsedTime++;

      const { entity, statement } = WorkshopExecutionRepository.upsertStatement(workshopExecution);

      await execOnDatabase({ statement: statement, parameters: entity });

      await publishMessageToTopic(
          AwsInfo.TIMER_NOTIFICATION_TOPIC_ARN,
          { id: workshopExecution.id },
          {topic: AwsInfo.WORKSHOPS_TOPIC_NAME}
      );
    }
  } catch (error) {
    console.log(error);
  }
};
