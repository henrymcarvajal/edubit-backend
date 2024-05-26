import { DbConfig } from '../../lambdas/commons/database/handler/config.mjs';
import { rowToObject } from '../ormMapper.mjs';

export const ImprovementTable = {
  schemaName: DbConfig.SCHEMA,
  tableName: 'improvement',
  qualifiedTableName: `${ DbConfig.SCHEMA }.improvement`,
  columnToFieldMappings: {
    // audit trails
    enabled: 'enabled',
    creation_date: 'creationDate',
    modification_date: 'modificationDate',
    disabled_date: 'disabledDate',
    // business
    id: 'id',
    name: 'name',
    description: 'description',
    price: 'price',
    code: 'code',
    rate: 'rate',
    prerequisite: 'prerequisite',
  },
  columnTypes: {
    price: 'int',
    code: 'int',
    prerequisite: 'int',
    rate: 'float',
  },
  orderColumns: [
    'prerequisite desc'
  ],

  rowToObject: (row) => {
    return rowToObject(row, ImprovementTable.columnToFieldMappings);
  }
};


