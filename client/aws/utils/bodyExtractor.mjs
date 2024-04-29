export const extractBody = (event) => {
  // event is required
  if (!event) throw 'event is required';

  // SQS message
  if (event.Records && event.Records.length > 0) {
    return {body: JSON.parse(event.Records[0].body), wait: false};
  }

  // API Gateway call
  if (event.body) {
    return {body: JSON.parse(event.body), wait: true};
  }

  //Lambda invoke
  return {body: event, wait: true};
};