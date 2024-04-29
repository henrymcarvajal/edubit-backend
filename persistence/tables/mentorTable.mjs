import { DbConfig } from '../../lambdas/commons/database/handler/config.mjs';
import { rowToObject } from '../ormMapper.mjs';

export const  MentorTable = {
  schemaName: DbConfig.SCHEMA,
  tableName: 'mentor',
  qualifiedTableName: `${DbConfig.SCHEMA}.mentor`,
  columnToFieldMappings: {
    // audit trails
    enabled: 'enabled',
    creation_date: 'creationDate',
    modification_date: 'modificationDate',
    disabled_date: 'disabledDate',
    // business
    id: 'id',
    user_id: 'userId',
    name: 'name',
    email: 'email',
    phone: 'phone',
    activities: 'activities',
  },

  rowToObject: (row) => {
    delete row.user_id;
    return rowToObject(row, MentorTable.columnToFieldMappings);
  }
};


