import { DbConfig } from '../../lambdas/commons/database/handler/config.mjs';
import { rowToObject } from '../ormMapper.mjs';

const WagesTable = {
  schemaName: DbConfig.SCHEMA,
  tableName: 'wages',
  qualifiedTableName: `${ DbConfig.SCHEMA }.wages`,
  columnToFieldMappings: {
    // audit trails
    enabled: 'enabled',
    //creation_date: 'creationDate',
    //modification_date: 'modificationDate',
    //disabled_date: 'disabledDate',
    // business
    id: 'id',
    max_levels: 'maxLevels',
    level_1: 'level1',
    level_2: 'level2',
    level_3: 'level3',
    level_4: 'level4',
  },
  columnTypes: {
    max_levels: 'int',
    level_1: 'int',
    level_2: 'int',
    level_3: 'int',
    level_4: 'int'
  },

  rowToObject(row) {
    return rowToObject(row, this.columnToFieldMappings);
  }
};

export default WagesTable;