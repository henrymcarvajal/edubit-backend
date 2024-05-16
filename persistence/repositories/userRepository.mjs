import { DmlOperators } from '../dml/dmlOperators.mjs';
import { UserTable } from '../tables/userTable.mjs';

import { insertClauseBuilder, parseCriteria, selectClauseBuilder, upsertClauseBuilder} from '../dml/dmlBuilders.mjs';
import { invokeDatabaseLambda } from '../../util/dbHelper.mjs';
import { objectToRow } from '../ormMapper.mjs';

export const UserRepository = {

  findByEmail: async (email) => {
    return UserRepository.findByCriteria(['email', DmlOperators.EQUALS, email]);
  },

  findByCriteria: async (...criteria) => {
    const [keys, operators, values] = parseCriteria(criteria);

    const statement = UserRepository.selectStatement(keys, operators);

    const rows = await invokeDatabaseLambda({statement: statement, parameters: values});

    let result = [];
    for (let row of rows) {
      result.push(UserTable.rowToObject(row));
    }

    return result;
  },

  selectStatement: (columns, operators) => {
    return selectClauseBuilder(UserTable, columns, operators);
  },

  insertStatement: (object) => {
    const entity = objectToRow(object, UserTable.columnToFieldMappings);
    const statement = insertClauseBuilder(UserTable.qualifiedTableName, UserTable.columnToFieldMappings, entity);
    return {entity: entity, statement: statement};
  },

  upsertStatement: (object) => {
    const entity = objectToRow(object, UserTable.columnToFieldMappings);
    const statement = upsertClauseBuilder(UserTable.qualifiedTableName, UserTable.columnToFieldMappings, entity);
    return {entity: entity, statement: statement};
  }
};
