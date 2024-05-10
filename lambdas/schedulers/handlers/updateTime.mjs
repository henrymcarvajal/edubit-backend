import { AwsInfo } from '../../../client/aws/AwsInfo.mjs';
import { WorkshopExecutionRepository } from '../../../persistence/repositories/workshopExecutionRepository.mjs';

import { extractBody } from '../../../client/aws/utils/bodyExtractor.mjs';
import { publishMessageToTopic } from '../../../client/aws/clients/snsClient.mjs';

import { Engine } from 'json-rules-engine';
import { execOnDatabase } from '../../../util/dbHelper.mjs';

const engine = new Engine();

engine.addOperator('multipleOf', (factValue, jsonValue) => {
  console.log('factValue', factValue);
  console.log('jsonValue', jsonValue);

  return parseInt(factValue) % parseInt(jsonValue) === 0;
});

/*exports.handle = async (event) => {

  console.log('event', event);

  engine.addRule({
    conditions: {
      any: [{
        all: [{
          fact: 'gameDuration',
          operator: 'equal',
          value: 40
        }, {
          fact: 'personalFoulCount',
          operator: 'greaterThanInclusive',
          value: 5
        }]
      }, {
        all: [{
          fact: 'gameDuration',
          operator: 'equal',
          value: 48
        }, {
          fact: 'personalFoulCount',
          operator: 'greaterThanInclusive',
          value: 6
        }]
      }]
    },
    event: {  // define the event to fire when the conditions evaluate truthy
      type: 'fouledOut',
      params: {
        message: 'Player has fouled out!'
      }
    }
  })

  /**
   * Define facts the engine will use to evaluate the conditions above.
   * Facts may also be loaded asynchronously at runtime; see the advanced example below
   *-/
  let facts = {
    personalFoulCount: 6,
    gameDuration: 40
  }

// Run the engine to evaluate
  engine
      .run(facts)
      .then(({ events }) => {
        events.map(event => console.log(event.params.message))
      })

};*/

engine.addRule({
      conditions: {
        any: [
          {
            fact: 'remainingTime',
            operator: 'multipleOf',
            value: 2
          },
          {
            fact: 'remainingTime',
            operator: 'multipleOf',
            value: 13
          },
          {
            fact: 'remainingTime',
            operator: 'multipleOf',
            value: 5
          }],
      },
      event: {  // define the event to fire when the conditions evaluate truthy
        type: 'tickedOff',
        params: {
          message: 'Time to tick off!'
        }
      }
    }
);

exports.handle = async (event) => {

  console.log('event', event);

  const {body} = extractBody(event);

  const [workshopExecution] = await WorkshopExecutionRepository.findById(body.id);

  workshopExecution.remainingTime-- ;
  workshopExecution.elapsedTime++;

  const {entity, statement} = WorkshopExecutionRepository.upsertStatement(workshopExecution);

  const [savedWorkshopExecution] =
      await execOnDatabase({statement: statement, parameters: entity});

  console.log("savedWorkshopExecution", savedWorkshopExecution);

  console.log("Sending SNS notification...")
  //await publishMessageToTopic(AwsInfo.TIMER_NOTIFICATION_TOPIC_ARN, {id: workshopExecution.id});
  console.log("Notification sent!");
  /*let facts = {
    remainingTime: new Date().getTime()
  }

  await engine
      .run(facts)
      .then(({ events }) => {
        console.log("event", event);
        events.map(event => console.log(event.params.message))
      })*/
};
