import { databaseErrorMapper } from './errorMapper.mjs';
import { extractBody } from '../../../../client/aws/utils/bodyExtractor.mjs';
import { setConfig } from './databasePoolConfig.mjs';

// consumer db connection pool
export let DBConsumerPool;

const buildFailedResult = (error) => {
  const result = Object.assign({}, error);
  result.message = error.message;
  result.failed = true;
  result.type = databaseErrorMapper(error.code);
  return result;
};

export const execute = async (event) => {

  const {body, wait} = extractBody(event);

  // if the connection pool is not configured
  if (!DBConsumerPool) {
    await setConfig();
  }

  try {
    if (!Array.isArray(body)) {
      return await DBConsumerPool.any(body.statement, body.parameters);
    } else {
      return await DBConsumerPool.tx(transaction => {
        const statements = [];
        for (let data of body) {
          statements.push(transaction.one(data.statement, data.parameters));
        }
        return transaction.batch(statements);
      });
    }
  } catch (error) {
    console.log("Database error", error);

    const result = buildFailedResult(error);
    if (wait) {
      return result;
    } else {
      throw result;
    }
  }
};

