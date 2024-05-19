import { extractBody } from '../../../client/aws/utils/bodyExtractor.mjs';

exports.handle = async (event) => {

  const {body} = extractBody(event);

  Object.keys(body.MessageAttributes).forEach(attributeKey => {
    const attribute = body.MessageAttributes[attributeKey];
    if (attribute.Type === 'String') {
      console.log(attributeKey, attribute.Value);
    } else if (attribute.Type === 'Number') {
      console.log(attributeKey, parseInt(attribute.Value));
    } else {
      console.log(attributeKey, JSON.parse(attribute.Value));
    }
  })

  console.log(`Calculating income at ${new Date()}`);
};
