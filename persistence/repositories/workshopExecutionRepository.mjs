import { DmlOperators } from '../dml/dmlOperators.mjs';
import {
  WorkshopExecutionTable,
  WorkshopExecution_InstitutionView,
  WorkshopExecution_ScheduleView,
  WorkshopExecution_DefinitionView
} from '../tables/workshopExecutionModel.mjs';

import { insertClauseBuilder, parseCriteria, selectClauseBuilder, upsertClauseBuilder } from '../dml/dmlBuilders.mjs';
import { invokeDatabaseLambda } from '../../util/dbHelper.mjs';
import { objectToRow } from '../ormMapper.mjs';

export const WorkshopExecutionRepository = {

  findById: async (id) => {
    return WorkshopExecutionRepository.findByCriteria(['id', DmlOperators.EQUALS, id]);
  },

  findByIdIn: async (ids) => {
    return WorkshopExecutionRepository.findByCriteria(['id', DmlOperators.IN, ids]);
  },

  findByInstitutionId: async (id) => {
    return WorkshopExecutionRepository.findViewByCriteria(WorkshopExecution_InstitutionView, ['id', DmlOperators.EQUALS, id]);
  },

  findScheduleById: async (id) => {
    return WorkshopExecutionRepository.findViewByCriteria(WorkshopExecution_ScheduleView, ['id', DmlOperators.EQUALS, id]);
  },

  findEnrollmentByParticipantId: async (id) => {
    return WorkshopExecutionRepository.findViewByCriteria(WorkshopExecution_DefinitionView,
        ['participants', DmlOperators.HAS_AS_TOP_LEVEL_KEY, id],
        ['scheduled_date', DmlOperators.GREATER_THAN_OR_EQUAL_TO, new Date(new Date().toISOString().slice(0, 10))]
    );
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
    return selectClauseBuilder(WorkshopExecutionTable, columns, operators);
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
