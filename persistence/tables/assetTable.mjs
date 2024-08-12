import { DbConfig } from '../../lambdas/commons/database/handler/config.mjs';
import { rowToObject } from '../ormMapper.mjs';

const AssetTable = {
  schemaName: DbConfig.SCHEMA,
  tableName: 'asset',
  qualifiedTableName: `${ DbConfig.SCHEMA }.asset`,
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
    price: 'price',
    type: 'type',
    image_url: 'imageUrl',
    mortgageable: 'mortgageable'
  },
  columnTypes: {
    price: 'int'
  },

  rowToObject(row) {
    return rowToObject(row, this.columnToFieldMappings);
  }
};

export default AssetTable;