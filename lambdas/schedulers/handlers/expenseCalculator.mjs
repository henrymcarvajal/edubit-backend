import { extractBody } from '../../../client/aws/utils/bodyExtractor.mjs';

exports.handle = async (event) => {

  const {body} = extractBody(event);

  console.log('body', body);

  console.log("Calculating expense...");
};
