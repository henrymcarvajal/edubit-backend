import { DbConfig } from '../../lambdas/commons/database/handler/config.mjs';
import { rowToObject } from '../ormMapper.mjs';

export const  UserTable = {
  schemaName: DbConfig.SCHEMA,
  tableName: 'user',
  qualifiedTableName: `${DbConfig.SCHEMA}.user`,
  columnToFieldMappings: {
    // audit trails
    enabled: 'enabled',
    creation_date: 'creationDate',
    modification_date: 'modificationDate',
    disabled_date: 'disabledDate',
    // business
    id: 'id',
    roles: 'roles',
    email: 'email',
  },

  rowToObject: (row) => {
    return rowToObject(row, UserTable.columnToFieldMappings);
  }
};


