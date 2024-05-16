import { DmlOperators } from './dmlOperators.mjs';

export const parseCriteria = (criteria) => {
  const keys = criteria.map(r => r[0]);
  const operators = criteria.map(r => r[1]);
  const values = criteria.map(r => r[2]);
  return [keys, operators, values];
};

export const selectClauseBuilder = (tableDefinition, columns, operators) => {
  const qualifiedTableName = `${tableDefinition.schemaName}.${tableDefinition.tableName}`;
  const tableAlias = `${tableDefinition.schemaName.substring(0, 1)}${tableDefinition.tableName.substring(0, 1)}`;
  const columnSeparator = ',';

  const castedColumns = selectColumnsWithTypes(tableDefinition.columnToFieldMappings, tableDefinition.columnTypes);

  return `SELECT ${castedColumns.map((column) => `${tableAlias}.${column}`).join(columnSeparator)}
          FROM ${qualifiedTableName} ${tableAlias}
          WHERE ` +
      whereClauseBuilder(tableAlias, columns, operators) +
      orderClauseBuilder();
};

export const orderClauseBuilder = (alias, columns) => {
  return '';
};

export const whereClauseBuilder = (alias, columns, operators) => {
  let whereClause = conditionClauseBuilder(alias, columns[0], operators[0], 1);
  for (const [i, column] of columns.entries()) {
    if (i > 0) {
      whereClause = whereClause + ` AND ${conditionClauseBuilder(alias, column, operators[i], i + 1)}`;
    }
  }
  return whereClause;
};

export const insertClauseBuilder = (qualifiedTableName, tableMappings, entity) => {
  const keys = extractEntityKeys(entity, tableMappings);
  return `INSERT INTO ${qualifiedTableName} (${keys.join(',')})
          VALUES (${keys.map(p => '${' + p + '}').join(',')}) RETURNING *`;
};

export const upsertClauseBuilder = (qualifiedTableName, tableMappings, entity) => {
  const keys = extractEntityKeys(entity, tableMappings);
  return `UPDATE ${qualifiedTableName}
          SET ${keys.map(p => `${p} = \$\{${p}\}`).join(',')}
          WHERE id = \$\{id\} RETURNING *`;
};

const conditionClauseBuilder = (alias, column, operator, index) => {
  switch (operator) {
    case DmlOperators.LIKE:
      return `${alias}.${column}::text ${operator} $${index}`;
    case DmlOperators.IN:
      return `${alias}.${column} ${operator} ($${index}:csv)`;
    case DmlOperators.NULL:
    case DmlOperators.NOT_NULL:
      return `${alias}.${column} ${operator}`;
  }

  return `${alias}.${column} ${operator} $${index}`;
};

const extractEntityKeys = (entity, tableMappings) => {
  const keys = [];
  for (let key of Object.keys(tableMappings)) {
    if (entity.hasOwnProperty(key)) {
      keys.push(key);
    }
  }
  return keys;
};

const selectColumnsWithTypes = (columnToFieldMappings, columnTypes) => {
  if (columnTypes) {
    return Object.keys(columnToFieldMappings).map(k => columnTypes[k] ? `${k}::${columnTypes[k]}` : `${k}`);
  }
  return Object.keys(columnToFieldMappings).map(k => `${k}`);
}