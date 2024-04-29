import { DbConfig } from '../../lambdas/commons/database/handler/config.mjs';
import { rowToObject } from '../ormMapper.mjs';

export const  InstitutionTable = {
  schemaName: DbConfig.SCHEMA,
  tableName: 'institution',
  qualifiedTableName: `${DbConfig.SCHEMA}.institution`,
  columnToFieldMappings: {
    // audit trails
    enabled: 'enabled',
    creation_date: 'creationDate',
    modification_date: 'modificationDate',
    disabled_date: 'disabledDate',
    // business
    id: 'id',
    name: 'name'
  },

  rowToObject: (row) => {
    return rowToObject(row, InstitutionTable.columnToFieldMappings);
  }
};


