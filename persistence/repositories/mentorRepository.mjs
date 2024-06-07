import { DmlOperators } from '../dml/dmlOperators.mjs';
import { MentorTable } from '../tables/mentorTable.mjs';

import { insertClauseBuilder, parseCriteria, selectClauseBuilder, upsertClauseBuilder} from '../dml/dmlBuilders.mjs';
import { invokeDatabaseLambda } from '../../util/dbHelper.mjs';
import { objectToRow } from '../ormMapper.mjs';

export const MentorRepository = {

  findById: async (id) => {
    return MentorRepository.findByCriteria(['id', DmlOperators.EQUALS, id]);
  },

  findByIdIn: async (ids) => {
    return MentorRepository.findByCriteria(['id', DmlOperators.IN, ids]);
  },

  findByEmail: async (email) => {
    return MentorRepository.findByCriteria(['email', DmlOperators.EQUALS, email]);
  },

  findByCriteria: async (...criteria) => {
    const [keys, operators, values] = parseCriteria(criteria);

    const statement = MentorRepository.selectStatement(keys, operators);

    const rows = await invokeDatabaseLambda({statement: statement, parameters: values});

    let result = [];
    for (let row of rows) {
      result.push(MentorTable.rowToObject(row));
    }

    return result;
  },

  selectStatement: (columns, operators) => {
    return selectClauseBuilder(MentorTable, columns, operators);
  },

  insertStatement: (object) => {
    const entity = objectToRow(object, MentorTable.columnToFieldMappings);
    const statement = insertClauseBuilder(MentorTable.qualifiedTableName, MentorTable.columnToFieldMappings, entity);
    return {entity: entity, statement: statement};
  },

  upsertStatement: (object) => {
    const entity = objectToRow(object, MentorTable.columnToFieldMappings);
    const statement = upsertClauseBuilder(MentorTable.qualifiedTableName, MentorTable.columnToFieldMappings, entity);
    return {entity: entity, statement: statement};
  }
};
