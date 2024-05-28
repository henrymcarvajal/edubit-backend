import { DbConfig } from '../../lambdas/commons/database/handler/config.mjs';
import { rowToObject } from '../ormMapper.mjs';

export const WorkshopDefinitionTable = {
  schemaName: DbConfig.SCHEMA,
  tableName: 'workshop_definition',
  qualifiedTableName: `${DbConfig.SCHEMA}.workshop_definition`,
  columnToFieldMappings: {
    // audit trails
    enabled: 'enabled',
    creation_date: 'creationDate',
    modification_date: 'modificationDate',
    disabled_date: 'disabledDate',
    // business
    id: 'id',
    name:  'name',
    schedule: 'schedule',
    authorizer: 'authorizer',
  },

  rowToObject: (row) => {
    return rowToObject(row, WorkshopDefinitionTable.columnToFieldMappings);
  }
};

export const WorkshopDefinition_WorkshopExecutionView = {
  schemaName: DbConfig.SCHEMA,
  columnToFieldMappings: {
    // audit trails
    enabled: 'enabled',
    creation_date: 'creationDate',
    modification_date: 'modificationDate',
    disabled_date: 'disabledDate',
    // business
    id: 'id',
    name:  'name',
    schedule: 'schedule',
    authorizer: 'authorizer'
  },
  selectStatement: `select wd.*
                    from ${DbConfig.SCHEMA}.workshop_execution we
                    join ${DbConfig.SCHEMA}.workshop_definition wd on wd.id = we.workshop_definition_id
                    where we.id = $1`,

  rowToObject: (row) => {
    return rowToObject(row, WorkshopDefinitionTable.columnToFieldMappings);
  }
};