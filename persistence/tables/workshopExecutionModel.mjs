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
  columnTypes: {
    elapsed_time: 'int',
    remaining_time: 'int',
    participants: 'json',
    mentors: 'json',
    activities: 'json'
  },

  rowToObject: (row) => {
    return rowToObject(row, WorkshopExecutionTable.columnToFieldMappings);
  }
}

export const WorkshopExecutionView = {
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
    remaining_time: 'remainingTime',
    workshop_name: 'workshopName',
  },
  columnTypesMappings: {
    elapsed_time: 'int',
    remaining_time: 'int'
  },
  selectStatement: `select we.*, wd."name" as workshop_name
                    from edubit.workshop_execution we
                    join edubit.workshop_definition wd on wd.id = we.workshop_definition_id
                    join edubit.institution i on i.id = we.institution_id where i.id = $1`,

  rowToObject: (row) => {
    return rowToObject(row, WorkshopExecutionView.columnToFieldMappings);
  }
}