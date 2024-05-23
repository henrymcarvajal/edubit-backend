import { DmlOperators } from '../dml/dmlOperators.mjs';
import { ParticipantProgressTable } from '../tables/ParticipantProgressTable.mjs';

import { insertClauseBuilder, parseCriteria, selectClauseBuilder, upsertClauseBuilder } from '../dml/dmlBuilders.mjs';
import { invokeDatabaseLambda } from '../../util/dbHelper.mjs';
import { objectToRow } from '../ormMapper.mjs';

export const ParticipantProgressRepository = {

  findById: async (id) => {
    return ParticipantProgressRepository.findByCriteria(['id', DmlOperators.EQUALS, id]);
  },

  findByParticipantIdAndWorkshopExecutionId: async (participantId, workshopExecutionId) => {
    return ParticipantProgressRepository.findByCriteria(
        ['participant_id', DmlOperators.EQUALS, participantId],
        ['workshop_execution_id', DmlOperators.EQUALS, workshopExecutionId]
    );
  },

  findByCriteria: async (...criteria) => {
    const [keys, operators, values] = parseCriteria(criteria);

    const statement = ParticipantProgressRepository.selectStatement(keys, operators);

    const rows = await invokeDatabaseLambda({ statement: statement, parameters: values });

    console.log('rows', rows);

    let result = [];
    for (let row of rows) {
      result.push(ParticipantProgressTable.rowToObject(row));
    }

    return result;
  },

  selectStatement: (columns, operators) => {
    return selectClauseBuilder(ParticipantProgressTable, columns, operators);
  },

  insertStatement: (object) => {
    const entity = objectToRow(object, ParticipantProgressTable.columnToFieldMappings);
    const statement = insertClauseBuilder(ParticipantProgressTable.qualifiedTableName, ParticipantProgressTable.columnToFieldMappings, entity);
    return { entity: entity, statement: statement };
  },

  upsertStatement: (object) => {
    const entity = objectToRow(object, ParticipantProgressTable.columnToFieldMappings);
    const statement = upsertClauseBuilder(ParticipantProgressTable.qualifiedTableName, ParticipantProgressTable.columnToFieldMappings, entity);
    return { entity: entity, statement: statement };
  }
};
