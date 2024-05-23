import { DbConfig } from '../../lambdas/commons/database/handler/config.mjs';
import { rowToObject } from '../ormMapper.mjs';

export const  ParticipantProgressTable = {
  schemaName: DbConfig.SCHEMA,
  tableName: 'participant_progress',
  qualifiedTableName: `${DbConfig.SCHEMA}.participant_progress`,
  columnToFieldMappings: {
    // audit trails
    creation_date: 'creationDate',
    modification_date: 'modificationDate',
    // business
    id: 'id',
    participant_id: 'participantId',
    workshop_execution_id: 'workshopExecutionId',
    details: 'details'
  },

  rowToObject: (row) => {
    return rowToObject(row, ParticipantProgressTable.columnToFieldMappings);
  }
};


