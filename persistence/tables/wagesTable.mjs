import { DbConfig } from '../../lambdas/commons/database/handler/config.mjs';
import { rowToObject } from '../ormMapper.mjs';

export const  WagesTable = {
  schemaName: DbConfig.SCHEMA,
  tableName: 'wages',
  qualifiedTableName: `${DbConfig.SCHEMA}.wages`,
  columnToFieldMappings: {
    // audit trails
    enabled: 'enabled',
    //creation_date: 'creationDate',
    //modification_date: 'modificationDate',
    //disabled_date: 'disabledDate',
    // business
    id: 'id',
    description: 'description',
    level_4: 'level4',
    level_3: 'level3',
    level_2: 'level2',
  },

  rowToObject: (row) => {
    return rowToObject(row, WagesTable.columnToFieldMappings);
  }
};


