import { DmlOperators } from '../dml/dmlOperators.mjs';
import { WorkshopExecutionTable } from '../tables/workshopExecutionTable.mjs';

import {
  insertClauseBuilder,
  parseCriteria,
  selectClauseBuilder,
  selectClauseBuilderWithTypes,
  upsertClauseBuilder
} from '../dml/dmlBuilders.mjs';
import { invokeDatabaseLambda } from '../../util/dbHelper.mjs';
import { objectToRow } from '../ormMapper.mjs';

export const WorkshopExecutionRepository = {

  //select * from workshop_

  findById: async (id) => {
    return WorkshopExecutionRepository.findByCriteria(['id', DmlOperators.EQUALS, id]);
  },

  findByInstitutionId: async (id) => {
    return WorkshopExecutionRepository.findByCriteria(['institution_id', DmlOperators.EQUALS, id]);
  },

  findAll: async () => {
    return WorkshopExecutionRepository.findByCriteria(['id', DmlOperators.NOT_NULL]);
  },

  findByCriteria: async (...criteria) => {
    const [keys, operators, values] = parseCriteria(criteria);

    const statement = WorkshopExecutionRepository.selectStatement(keys, operators);
    const rows = await invokeDatabaseLambda({statement: statement, parameters: values});

    let result = [];
    for (let row of rows) {
      result.push(WorkshopExecutionTable.rowToObject(row));
    }

    return result;
  },

  selectStatement: (columns, operators) => {
    return selectClauseBuilderWithTypes(
        WorkshopExecutionTable.schemaName,
        WorkshopExecutionTable.tableName,
        WorkshopExecutionTable.columnToFieldMappings,
        WorkshopExecutionTable.columnTypesMappings,
        columns,
        operators
    );
  },

  insertStatement: (object) => {
    const entity = objectToRow(object, WorkshopExecutionTable.columnToFieldMappings);
    const statement = insertClauseBuilder(WorkshopExecutionTable.qualifiedTableName, WorkshopExecutionTable.columnToFieldMappings, entity);
    return {entity: entity, statement: statement};
  },

  upsertStatement: (object) => {
    const entity = objectToRow(object, WorkshopExecutionTable.columnToFieldMappings);
    const statement = upsertClauseBuilder(WorkshopExecutionTable.qualifiedTableName, WorkshopExecutionTable.columnToFieldMappings, entity);
    return {entity: entity, statement: statement};
  }
}
