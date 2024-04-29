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
    schedule: 'schedule'
  },

  rowToObject: (row) => {
    return rowToObject(row, WorkshopDefinitionTable.columnToFieldMappings);
  }
};