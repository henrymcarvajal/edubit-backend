import { DmlOperators } from '../dml/dmlOperators.mjs';
import { User_UserMemberView, UserModel } from '../tables/userModel.mjs';

import { insertClauseBuilder, parseCriteria, selectClauseBuilder, upsertClauseBuilder} from '../dml/dmlBuilders.mjs';
import { invokeDatabaseLambda } from '../../util/dbHelper.mjs';
import { objectToRow } from '../ormMapper.mjs';

export const UserRepository = {

  findByEmail: async (email) => {
    return UserRepository.findByCriteria(['email', DmlOperators.EQUALS, email]);
  },

  findViewByEmail: async (email) => {
    return UserRepository.findViewByCriteria(User_UserMemberView, ['email', DmlOperators.EQUALS, email]);
  },

  findByCriteria: async (...criteria) => {
    const [keys, operators, values] = parseCriteria(criteria);

    const statement = UserRepository.selectStatement(keys, operators);

    const rows = await invokeDatabaseLambda({statement: statement, parameters: values});

    let result = [];
    for (let row of rows) {
      result.push(UserModel.rowToObject(row));
    }

    return result;
  },

  findViewByCriteria: async (view, ...criteria) => {
    const [_, __, values] = parseCriteria(criteria);

    const rows = await invokeDatabaseLambda({statement: view.selectStatement, parameters: values});

    let result = [];
    for (let row of rows) {
      result.push(view.rowToObject(row));
    }

    return result;
  },

  selectStatement: (columns, operators) => {
    return selectClauseBuilder(UserModel, columns, operators);
  },

  insertStatement: (object) => {
    const entity = objectToRow(object, UserModel.columnToFieldMappings);
    const statement = insertClauseBuilder(UserModel.qualifiedTableName, UserModel.columnToFieldMappings, entity);
    return {entity: entity, statement: statement};
  },

  upsertStatement: (object) => {
    const entity = objectToRow(object, UserModel.columnToFieldMappings);
    const statement = upsertClauseBuilder(UserModel.qualifiedTableName, UserModel.columnToFieldMappings, entity);
    return {entity: entity, statement: statement};
  }
};
