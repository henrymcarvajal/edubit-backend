import { setConfig } from './databasePoolConfig.mjs';

// consumer db connection pool
let DBConsumerPool;

export const execute = async (event, context) => {

  //await initializeLambda(event, context);

  try {
    // if the connection pool is not configured
    if (!DBConsumerPool) {
      await setConfig();
    }

    // pull the statement and parameters from the event
    let statement = event.statement;
    let parameters = event.parameters;

    if (event.Records && event.Records.length > 0) {
      statement = event.Records[0].messageAttributes.statement.stringValue;
      parameters = event.Records[0].messageAttributes.parameters.stringValue.split(',');

    }

    if (!statement) {
      let message = 'No statement specified';
      return new Error(message);
    }

    statement = 'insert into picdi.user (email, name, enabled) values (\${email}, \${name}, \${enabled}) returning *';
    const values1 = {
      email: 'yyy',
      name: 'xxxx',
      enabled: true
    };
    const values2 = {
      email: 'aaa',
      name: 'ffdgfdgdf',
      enabled: true
    };

    return await DBConsumerPool.tx(t => {
      const t1 = t.one(statement, values1);
      const t2 = t.one(statement, values2);
      return t.batch([t1, t2]);
    })
        .catch(error => {
          throw error;
        });

  } catch (e) {
    const failure = Object.assign({}, e);
    failure.message = e.message;
    return failure;
  }
};