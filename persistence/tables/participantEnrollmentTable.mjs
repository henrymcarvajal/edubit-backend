import { DbConfig } from '../../lambdas/commons/database/handler/config.mjs';
import { rowToObject } from '../ormMapper.mjs';

const ParticipantEnrollmentTable = {
  schemaName: DbConfig.SCHEMA,
  tableName: 'participant_enrollment',
  qualifiedTableName: `${ DbConfig.SCHEMA }.participant_enrollment`,
  columnToFieldMappings: {
    // audit trails
    creation_date: 'creationDate',
    modification_date: 'modificationDate',
    // business
    id: 'id',
    participant_id: 'participantId',
    workshop_execution_id: 'workshopExecutionId',
    active_income: 'activeIncome',
    passive_income: 'passiveIncome',
    balance: 'balance'
  },

  rowToObject: (row) => {
    return rowToObject(row, ParticipantEnrollmentTable.columnToFieldMappings);
  }
};

export default ParticipantEnrollmentTable;
