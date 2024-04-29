import { InstitutionTable } from '../tables/institutionTable.mjs';
import { DmlOperators } from '../dml/dmlOperators.mjs';

import { insertClauseBuilder, parseCriteria, selectClauseBuilder, upsertClauseBuilder } from '../dml/dmlBuilders.mjs';
import { invokeDatabaseLambda } from '../../util/dbHelper.mjs';
import { objectToRow } from '../ormMapper.mjs';

export const InstitutionRepository = {

  findById: async (id) => {
    return InstitutionRepository.findByCriteria(['id', DmlOperators.EQUALS, id]);
  },

  findAll: async () => {
    return InstitutionRepository.findByCriteria(['id', DmlOperators.NOT_NULL]);
  },

  findAllEnabled: async () => {
    return InstitutionRepository.findByCriteria(['enabled', DmlOperators.EQUALS, true]);
  },

  findByCriteria: async (...criteria) => {
    const [keys, operators, values] = parseCriteria(criteria);

    const statement = InstitutionRepository.selectStatement(keys, operators);

    const rows = await invokeDatabaseLambda({statement: statement, parameters: values});

    let result = [];
    for (let row of rows) {
      result.push(InstitutionTable.rowToObject(row));
    }

    return result;
  },

  selectStatement: (columns, operators) => {
    return selectClauseBuilder(InstitutionTable.schemaName, InstitutionTable.tableName, InstitutionTable.columnToFieldMappings, columns, operators);
  },

  insertStatement: (object) => {
    const entity = objectToRow(object, InstitutionTable.columnToFieldMappings);
    const statement = insertClauseBuilder(InstitutionTable.qualifiedTableName, InstitutionTable.columnToFieldMappings, entity);
    return {entity: entity, statement: statement};
  },

  upsertStatement: (object) => {
    const entity = objectToRow(object, InstitutionTable.columnToFieldMappings);
    const statement = upsertClauseBuilder(InstitutionTable.qualifiedTableName, InstitutionTable.columnToFieldMappings, entity);
    return {entity: entity, statement: statement};
  }
};
