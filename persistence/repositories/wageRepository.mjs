import { DmlOperators } from '../dml/dmlOperators.mjs';
import { WagesTable } from '../tables/wagesTable.mjs';

import { insertClauseBuilder, parseCriteria, selectClauseBuilder, upsertClauseBuilder } from '../dml/dmlBuilders.mjs';
import { invokeDatabaseLambda } from '../../util/dbHelper.mjs';
import { objectToRow } from '../ormMapper.mjs';

export const WagesRepository = {

  findById: async (id) => {
    return WagesRepository.findByCriteria(['id', DmlOperators.EQUALS, id]);
  },

  findAll: async () => {
    return WagesRepository.findByCriteria(['id', DmlOperators.NOT_NULL]);
  },

  findAllEnabled: async () => {
    return WagesRepository.findByCriteria(['enabled', DmlOperators.EQUALS, true]);
  },

  findByCriteria: async (...criteria) => {
    const [keys, operators, values] = parseCriteria(criteria);

    const statement = WagesRepository.selectStatement(keys, operators);

    const rows = await invokeDatabaseLambda({statement: statement, parameters: values});

    let result = [];
    for (let row of rows) {
      result.push(WagesTable.rowToObject(row));
    }

    return result;
  },

  selectStatement: (columns, operators) => {
    return selectClauseBuilder(WagesTable, columns, operators);
  },

  insertStatement: (object) => {
    const entity = objectToRow(object, WagesTable.columnToFieldMappings);
    const statement = insertClauseBuilder(WagesTable.qualifiedTableName, WagesTable.columnToFieldMappings, entity);
    return {entity: entity, statement: statement};
  },

  upsertStatement: (object) => {
    const entity = objectToRow(object, WagesTable.columnToFieldMappings);
    const statement = upsertClauseBuilder(WagesTable.qualifiedTableName, WagesTable.columnToFieldMappings, entity);
    return {entity: entity, statement: statement};
  }
};
