import { DbConfig } from '../../lambdas/commons/database/handler/config.mjs';
import { rowToObject } from '../ormMapper.mjs';

export const  AssetTable = {
  schemaName: DbConfig.SCHEMA,
  tableName: 'asset',
  qualifiedTableName: `${DbConfig.SCHEMA}.asset`,
  columnToFieldMappings: {
    // audit trails
    enabled: 'enabled',
    creation_date: 'creationDate',
    modification_date: 'modificationDate',
    disabled_date: 'disabledDate',
    // business
    id: 'id',
    title: 'title',
    description: 'description',
    price: 'price'
  },
  columnTypesMappings: {
    price: 'int'
  },

  rowToObject: (row) => {
    return rowToObject(row, AssetTable.columnToFieldMappings);
  }
};


