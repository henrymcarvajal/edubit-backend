import { insertClauseBuilder, parseCriteria, selectClauseBuilder, upsertClauseBuilder } from './dmlBuilders.mjs';
import { objectToRow } from '../ormMapper.mjs';
import { invokeDatabaseLambda } from '../../util/dbHelper.mjs';

export const dmlOperations = {
  selectStatement: (table, columns, operators) => {
    return selectClauseBuilder(table, columns, operators);
  },

  insertStatement: (table, object) => {
    const entity = objectToRow(object, table.columnToFieldMappings);
    const statement = insertClauseBuilder(table.qualifiedTableName, table.columnToFieldMappings, entity);
    return { entity: entity, statement: statement };
  },

  upsertStatement: (table, object) => {
    const entity = objectToRow(object, table.columnToFieldMappings);
    const statement = upsertClauseBuilder(table.qualifiedTableName, table.columnToFieldMappings, entity);
    return { entity: entity, statement: statement };
  },

  findByCriteria: async (repository, ...criteria) => {
    const [keys, operators, values] = parseCriteria(criteria);

    const statement = repository.selectStatement(keys, operators);
    const rows = await invokeDatabaseLambda({ statement: statement, parameters: values });

    let result = [];
    for (let row of rows) {
      result.push(repository.table.rowToObject(row));
    }

    return result;
  },

  findViewByCriteria: async (view, ...criteria) => {
    const [_, __, values] = parseCriteria(criteria);

    const rows = await invokeDatabaseLambda({ statement: view.selectStatement, parameters: values });

    let result = [];
    for (let row of rows) {
      result.push(view.rowToObject(row));
    }

    return result;
  }
};