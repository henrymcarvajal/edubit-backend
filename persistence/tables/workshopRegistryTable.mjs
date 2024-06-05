import { DbConfig } from '../../lambdas/commons/database/handler/config.mjs';
import { rowToObject } from '../ormMapper.mjs';

export const WorkshopRegistryTable = {
  schemaName: DbConfig.SCHEMA,
  tableName: 'workshop_registry',
  qualifiedTableName: `${ DbConfig.SCHEMA }.workshop_registry`,
  columnToFieldMappings: {
    // audit trails
    creation_date: 'creationDate',
    // business
    id: 'id',
    workshop_execution_id: 'workshopExecutionId',
    event: 'event'
  },
  orderColumns: [
    'creation_date desc'
  ],
  limitRows: 10,

  rowToObject: (row) => {
    return rowToObject(row, WorkshopRegistryTable.columnToFieldMappings);
  }
};