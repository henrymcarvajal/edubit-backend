import { DbConfig } from '../../lambdas/commons/database/handler/config.mjs';
import { rowToObject } from '../ormMapper.mjs';

export const  ParticipantTable = {
  schemaName: DbConfig.SCHEMA,
  tableName: 'participant',
  qualifiedTableName: `${DbConfig.SCHEMA}.participant`,
  columnToFieldMappings: {
    // audit trails
    enabled: 'enabled',
    creation_date: 'creationDate',
    modification_date: 'modificationDate',
    disabled_date: 'disabledDate',
    // business
    id: 'id',
    //user_id: 'userId', commented out for security reasons
    name: 'name',
    email: 'email',
    grade: 'grade',
    parent_phone: 'parentPhone',
    parent_email: 'parentEmail',
    activities: 'activities',
  },

  rowToObject: (row) => {
    return rowToObject(row, ParticipantTable.columnToFieldMappings);
  }
};


