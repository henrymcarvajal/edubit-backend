import { DbConfig } from '../../lambdas/commons/database/handler/config.mjs';
import { rowToObject } from '../ormMapper.mjs';

export const  ActivityTable = {
  schemaName: DbConfig.SCHEMA,
  tableName: 'activity',
  qualifiedTableName: `${DbConfig.SCHEMA}.activity`,
  columnToFieldMappings: {
    // audit trails
    enabled: 'enabled',
    creation_date: 'creationDate',
    modification_date: 'modificationDate',
    disabled_date: 'disabledDate',
    // business
    id: 'id',
    name: 'name',
    levels: 'levels',
    abilities: 'abilities',
    description: 'description'
  },

  rowToObject: (row) => {
    return rowToObject(row, ActivityTable.columnToFieldMappings);
  }
};


