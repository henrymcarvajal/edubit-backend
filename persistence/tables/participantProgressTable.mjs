import { DbConfig } from '../../lambdas/commons/database/handler/config.mjs';
import { rowToObject } from '../ormMapper.mjs';

export const ParticipantProgressTable = {
  schemaName: DbConfig.SCHEMA,
  tableName: 'participant_progress',
  qualifiedTableName: `${ DbConfig.SCHEMA }.participant_progress`,
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

export const ParticipantProgressTable_CurrentActivityView = {
  columnToFieldMappings: {
    id: 'id',
    name: 'name',
    levels: 'levels'
  },
  selectStatement: `select a.id, a."name", a.levels::int
                      from edubit.activity a where id = (
                           select (pp.details #>>'{stats,currentActivity,id}')::uuid
                             from edubit.participant_progress pp
                            where pp.participant_id = $1
                            and pp.workshop_execution_id = $2)`,

  rowToObject: (row) => {
    return rowToObject(row, ParticipantProgressTable_CurrentActivityView.columnToFieldMappings);
  }
};

