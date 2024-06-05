import { DmlOperators } from '../dml/dmlOperators.mjs';
import { WorkshopRegistryTable } from '../tables/workshopRegistryTable.mjs';

import { insertClauseBuilder, parseCriteria, selectClauseBuilder, upsertClauseBuilder } from '../dml/dmlBuilders.mjs';
import { invokeDatabaseLambda } from '../../util/dbHelper.mjs';
import { objectToRow } from '../ormMapper.mjs';

export const WorkshopRegistryRepository = {

  findById: async (id) => {
    return WorkshopRegistryRepository.findByCriteria(['id', DmlOperators.EQUALS, id]);
  },

  findByWorkshopExecutionId: async (id) => {
    return WorkshopRegistryRepository.findByCriteria(['workshop_execution_id', DmlOperators.EQUALS, id]);
  },

  findByCriteria: async (...criteria) => {
    const [keys, operators, values] = parseCriteria(criteria);

    const statement = WorkshopRegistryRepository.selectStatement(keys, operators);
    const rows = await invokeDatabaseLambda({ statement: statement, parameters: values });

    let result = [];
    for (let row of rows) {
      result.push(WorkshopRegistryTable.rowToObject(row));
    }

    return result;
  },

  selectStatement: (columns, operators) => {
    return selectClauseBuilder(WorkshopRegistryTable, columns, operators);
  },

  insertStatement: (object) => {
    const entity = objectToRow(object, WorkshopRegistryTable.columnToFieldMappings);
    const statement = insertClauseBuilder(WorkshopRegistryTable.qualifiedTableName, WorkshopRegistryTable.columnToFieldMappings, entity);
    return { entity: entity, statement: statement };
  },

  upsertStatement: (object) => {
    const entity = objectToRow(object, WorkshopRegistryTable.columnToFieldMappings);
    const statement = upsertClauseBuilder(WorkshopRegistryTable.qualifiedTableName, WorkshopRegistryTable.columnToFieldMappings, entity);
    return { entity: entity, statement: statement };
  }
};
