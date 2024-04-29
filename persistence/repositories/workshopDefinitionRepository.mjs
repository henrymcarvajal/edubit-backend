import { DmlOperators } from '../dml/dmlOperators.mjs';
import { WorkshopDefinitionTable } from '../tables/workshopDefinitionTable.mjs';

import { insertClauseBuilder, parseCriteria, selectClauseBuilder, upsertClauseBuilder} from '../dml/dmlBuilders.mjs';
import { invokeDatabaseLambda } from '../../util/dbHelper.mjs';
import { objectToRow } from '../ormMapper.mjs';

export const WorkshopDefinitionRepository = {

  findById: async (id) => {
    return WorkshopDefinitionRepository.findByCriteria(['id', DmlOperators.EQUALS, id]);
  },

  findByCriteria: async (...criteria) => {
    const [keys, operators, values] = parseCriteria(criteria);

    const statement = WorkshopDefinitionRepository.selectStatement(keys, operators);
    const rows = await invokeDatabaseLambda({statement: statement, parameters: values});

    let result = [];
    for (let row of rows) {
      result.push(WorkshopDefinitionTable.rowToObject(row));
    }

    return result;
  },

  selectStatement: (columns, operators) => {
    return selectClauseBuilder(WorkshopDefinitionTable.schemaName, WorkshopDefinitionTable.tableName, WorkshopDefinitionTable.columnToFieldMappings, columns, operators);
  },

  insertStatement: (object) => {
    const entity = objectToRow(object, WorkshopDefinitionTable.columnToFieldMappings);
    const statement = insertClauseBuilder(WorkshopDefinitionTable.qualifiedTableName, WorkshopDefinitionTable.columnToFieldMappings, entity);
    return {entity: entity, statement: statement};
  },

  upsertStatement: (object) => {
    const entity = objectToRow(object, WorkshopDefinitionTable.columnToFieldMappings);
    const statement = upsertClauseBuilder(WorkshopDefinitionTable.qualifiedTableName, WorkshopDefinitionTable.columnToFieldMappings, entity);
    return {entity: entity, statement: statement};
  }
};
