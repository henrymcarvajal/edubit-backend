import { DmlOperators } from '../dml/dmlOperators.mjs';
import { ParticipantEnrollmentTable } from '../tables/participantEnrollmentTable.mjs';

import { insertClauseBuilder, parseCriteria, selectClauseBuilder, upsertClauseBuilder} from '../dml/dmlBuilders.mjs';
import { invokeDatabaseLambda } from '../../util/dbHelper.mjs';
import { objectToRow } from '../ormMapper.mjs';

export const ParticipantEnrollmentRepository = {

  findById: async (id) => {
    return ParticipantEnrollmentRepository.findByCriteria(['id', DmlOperators.EQUALS, id]);
  },

  findByCriteria: async (...criteria) => {
    const [keys, operators, values] = parseCriteria(criteria);

    const statement = ParticipantEnrollmentRepository.selectStatement(keys, operators);

    const rows = await invokeDatabaseLambda({statement: statement, parameters: values});

    let result = [];
    for (let row of rows) {
      result.push(ParticipantEnrollmentTable.rowToObject(row));
    }

    return result;
  },

  selectStatement: (columns, operators) => {
    return selectClauseBuilder(ParticipantEnrollmentTable, columns, operators);
  },

  insertStatement: (object) => {
    const entity = objectToRow(object, ParticipantEnrollmentTable.columnToFieldMappings);
    const statement = insertClauseBuilder(ParticipantEnrollmentTable.qualifiedTableName, ParticipantEnrollmentTable.columnToFieldMappings, entity);
    return {entity: entity, statement: statement};
  },

  upsertStatement: (object) => {
    const entity = objectToRow(object, ParticipantEnrollmentTable.columnToFieldMappings);
    const statement = upsertClauseBuilder(ParticipantEnrollmentTable.qualifiedTableName, ParticipantEnrollmentTable.columnToFieldMappings, entity);
    return {entity: entity, statement: statement};
  }
};
