import { parseCriteria } from './dmlBuilders.mjs';
import { invokeDatabaseLambda } from '../../util/dbHelper.mjs';


export const findByCriteria = async (repository, ...criteria) => {
  const [keys, operators, values] = parseCriteria(criteria);

  const statement = repository.selectStatement(keys, operators);
  const rows = await invokeDatabaseLambda({ statement: statement, parameters: values });

  let result = [];
  for (let row of rows) {
    result.push(repository.table.rowToObject(row));
  }

  return result;
}

export const findViewByCriteria = async (view, ...criteria) => {
  const [_, __, values] = parseCriteria(criteria);

  const rows = await invokeDatabaseLambda({ statement: view.selectStatement, parameters: values });

  let result = [];
  for (let row of rows) {
    result.push(view.rowToObject(row));
  }

  return result;
}
