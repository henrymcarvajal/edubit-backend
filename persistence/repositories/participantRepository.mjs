import { DmlOperators } from '../dml/dmlOperators.mjs';
import { ParticipantTable } from '../tables/participantTable.mjs';

import { insertClauseBuilder, parseCriteria, selectClauseBuilder, upsertClauseBuilder} from '../dml/dmlBuilders.mjs';
import { invokeDatabaseLambda } from '../../util/dbHelper.mjs';
import { objectToRow } from '../ormMapper.mjs';

export const ParticipantRepository = {

  findById: async (id) => {
    return ParticipantRepository.findByCriteria(['id', DmlOperators.EQUALS, id]);
  },

  findByEmail: async (email) => {
    return ParticipantRepository.findByCriteria(['email', DmlOperators.EQUALS, email]);
  },

  findByCriteria: async (...criteria) => {
    const [keys, operators, values] = parseCriteria(criteria);

    const statement = ParticipantRepository.selectStatement(keys, operators);

    const rows = await invokeDatabaseLambda({statement: statement, parameters: values});

    let result = [];
    for (let row of rows) {
      row.grade = parseInt(row.grade);
      row.parent_phone = parseInt(row.parent_phone);
      result.push(ParticipantTable.rowToObject(row));
    }

    return result;
  },

  selectStatement: (columns, operators) => {
    return selectClauseBuilder(ParticipantTable.schemaName, ParticipantTable.tableName, ParticipantTable.columnToFieldMappings, columns, operators);
  },

  insertStatement: (object) => {
    const entity = objectToRow(object, ParticipantTable.columnToFieldMappings);
    const statement = insertClauseBuilder(ParticipantTable.qualifiedTableName, ParticipantTable.columnToFieldMappings, entity);
    return {entity: entity, statement: statement};
  },

  upsertStatement: (object) => {
    const entity = objectToRow(object, ParticipantTable.columnToFieldMappings);
    const statement = upsertClauseBuilder(ParticipantTable.qualifiedTableName, ParticipantTable.columnToFieldMappings, entity);
    return {entity: entity, statement: statement};
  }
};
