import { AssetTable } from '../tables/assetTable.mjs';
import { DmlOperators } from '../dml/dmlOperators.mjs';

import { insertClauseBuilder, parseCriteria, selectClauseBuilder, upsertClauseBuilder} from '../dml/dmlBuilders.mjs';
import { invokeDatabaseLambda } from '../../util/dbHelper.mjs';
import { objectToRow } from '../ormMapper.mjs';

export const AssetRepository = {

  findById: async (id) => {
    return AssetRepository.findByCriteria(['id', DmlOperators.EQUALS, id]);
  },

  findByIdIn: async (ids) => {
    return AssetRepository.findByCriteria(['id', DmlOperators.IN, ids]);
  },

  findByIdInEnabled: async (ids) => {
    return AssetRepository.findByCriteria(
        ['id', DmlOperators.IN, ids],
        ['enabled', DmlOperators.EQUALS, true]
    );
  },

  findAll: async () => {
    return AssetRepository.findByCriteria(['id', DmlOperators.NOT_NULL]);
  },

  findAllEnabled: async () => {
    return AssetRepository.findByCriteria(['enabled', DmlOperators.EQUALS, true]);
  },

  findByCriteria: async (...criteria) => {
    const [keys, operators, values] = parseCriteria(criteria);

    const statement = AssetRepository.selectStatement(keys, operators);

    const rows = await invokeDatabaseLambda({statement: statement, parameters: values});

    let result = [];
    for (let row of rows) {
      result.push(AssetTable.rowToObject(row));
    }

    return result;
  },

  selectStatement: (columns, operators) => {
    return selectClauseBuilder(AssetTable, columns, operators);
  },

  insertStatement: (object) => {
    const entity = objectToRow(object, AssetTable.columnToFieldMappings);
    const statement = insertClauseBuilder(AssetTable.qualifiedTableName, AssetTable.columnToFieldMappings, entity);
    return {entity: entity, statement: statement};
  },

  upsertStatement: (object) => {
    const entity = objectToRow(object, AssetTable.columnToFieldMappings);
    const statement = upsertClauseBuilder(AssetTable.qualifiedTableName, AssetTable.columnToFieldMappings, entity);
    return {entity: entity, statement: statement};
  }
};
