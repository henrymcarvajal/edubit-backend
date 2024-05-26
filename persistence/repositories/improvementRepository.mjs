import { ImprovementTable } from '../tables/improvementTable.mjs';
import { DmlOperators } from '../dml/dmlOperators.mjs';

import { insertClauseBuilder, parseCriteria, selectClauseBuilder, upsertClauseBuilder } from '../dml/dmlBuilders.mjs';
import { invokeDatabaseLambda } from '../../util/dbHelper.mjs';
import { objectToRow } from '../ormMapper.mjs';

export const ImprovementRepository = {

  findById: async (id) => {
    return ImprovementRepository.findByCriteria(['id', DmlOperators.EQUALS, id]);
  },

  findByIdIn: async (ids) => {
    return ImprovementRepository.findByCriteria(['id', DmlOperators.IN, ids]);
  },

  findAll: async () => {
    return ImprovementRepository.findByCriteria(['id', DmlOperators.NOT_NULL]);
  },

  findAllEnabled: async () => {
    return ImprovementRepository.findByCriteria(['enabled', DmlOperators.EQUALS, true]);
  },

  findByCriteria: async (...criteria) => {
    const [keys, operators, values] = parseCriteria(criteria);

    const statement = ImprovementRepository.selectStatement(keys, operators);

    const rows = await invokeDatabaseLambda({statement: statement, parameters: values});

    let result = [];
    for (let row of rows) {
      result.push(ImprovementTable.rowToObject(row));
    }

    return result;
  },

  selectStatement: (columns, operators) => {
    return selectClauseBuilder(ImprovementTable, columns, operators);
  },

  insertStatement: (object) => {
    const entity = objectToRow(object, ImprovementTable.columnToFieldMappings);
    const statement = insertClauseBuilder(ImprovementTable.qualifiedTableName, ImprovementTable.columnToFieldMappings, entity);
    return {entity: entity, statement: statement};
  },

  upsertStatement: (object) => {
    const entity = objectToRow(object, ImprovementTable.columnToFieldMappings);
    const statement = upsertClauseBuilder(ImprovementTable.qualifiedTableName, ImprovementTable.columnToFieldMappings, entity);
    return {entity: entity, statement: statement};
  }
};
