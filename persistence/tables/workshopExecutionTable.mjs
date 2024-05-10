import { DbConfig } from '../../lambdas/commons/database/handler/config.mjs';
import { rowToObject } from '../ormMapper.mjs';

export const WorkshopExecutionTable = {
  schemaName: DbConfig.SCHEMA,
  tableName: 'workshop_execution',
  qualifiedTableName: `${DbConfig.SCHEMA}.workshop_execution`,
  columnToFieldMappings: {
    // audit trails
    creation_date: 'creationDate',
    modification_date: 'modificationDate',
    // business
    id: 'id',
    workshop_definition_id: 'workshopDefinitionId',
    institution_id: 'institutionId',
    participants: 'participants',
    mentors: 'mentors',
    activities: 'activities',
    scheduled_date: 'scheduledDate',
    start_timestamp: 'startTimestamp',
    end_timestamp: 'endTimestamp',
    elapsed_time: 'elapsedTime',
    remaining_time: 'remainingTime'
  },
  columnTypesMappings: {
    elapsed_time: 'int',
    remaining_time: 'int'
  },

  rowToObject: (row) => {
    return rowToObject(row, WorkshopExecutionTable.columnToFieldMappings);
  }
};
