import { ActivityTable } from '../tables/activityTable.mjs';
import { DmlOperators } from '../dml/dmlOperators.mjs';

import { insertClauseBuilder, parseCriteria, selectClauseBuilder, upsertClauseBuilder} from '../dml/dmlBuilders.mjs';
import { invokeDatabaseLambda } from '../../util/dbHelper.mjs';
import { objectToRow } from '../ormMapper.mjs';

export const ActivityRepository = {

  findById: async (id) => {
    return ActivityRepository.findByCriteria(['id', DmlOperators.EQUALS, id]);
  },

  findAll: async () => {
    return ActivityRepository.findByCriteria(['id', DmlOperators.NOT_NULL]);
  },

  findAllEnabled: async () => {
    return ActivityRepository.findByCriteria(['enabled', DmlOperators.EQUALS, true]);
  },

  findByCriteria: async (...criteria) => {
    const [keys, operators, values] = parseCriteria(criteria);

    const statement = ActivityRepository.selectStatement(keys, operators);

    const rows = await invokeDatabaseLambda({statement: statement, parameters: values});

    let result = [];
    for (let row of rows) {
      result.push(ActivityTable.rowToObject(row));
    }

    return result;
  },

  selectStatement: (columns, operators) => {
    return selectClauseBuilder(ActivityTable, columns, operators);
  },

  insertStatement: (object) => {
    const entity = objectToRow(object, ActivityTable.columnToFieldMappings);
    const statement = insertClauseBuilder(ActivityTable.qualifiedTableName, ActivityTable.columnToFieldMappings, entity);
    return {entity: entity, statement: statement};
  },

  upsertStatement: (object) => {
    const entity = objectToRow(object, ActivityTable.columnToFieldMappings);
    const statement = upsertClauseBuilder(ActivityTable.qualifiedTableName, ActivityTable.columnToFieldMappings, entity);
    return {entity: entity, statement: statement};
  }
};
