import * as path from 'path';

import handlebars from 'handlebars';

import { readFile } from './fileReader.mjs';
import { extractBody } from '../../../../client/aws/utils/bodyExtractor.mjs';
import { sendEmail } from '../../../../client/zoho/client/emailClient.mjs';

export const execute = async (event) => {

  const { body: messages } = extractBody(event);

  for (const message of messages) {

    try {

      if (!Object.entries(message).length) {
        console.log(`Message is empty`);
        break;
      }

      if (!message.recipients || !Array.isArray(message.recipients)) {
        console.log(`Recipients is empty or is not an array: ${JSON.stringify(message)}`);
        break;
      }

      if (!message.contents) {
        console.log(`Message content is empty: ${JSON.stringify(message)}`);
        break;
      }

      if (!message.contents.template) {
        console.log(`Message does not have a template: ${JSON.stringify(message)}`);
        break;
      }

      let templateContents = await loadTemplate(message.contents.template);

      if (templateContents) {
        console.log('Send email');
        const messageContents = prepareContents(templateContents, message.contents.replacements);
        const result = await sendEmail(message.recipients, message.subject ? message.subject : 'Sin asunto', messageContents, message.contents.attachments);
        console.log('sendEmail', result);
      } else {
        console.log(`Template not found: ${message.contents.template}` );
        //throw new Error(`no content for file at ${templatePath}`);
      }
    } catch (error) {
      console.log('error in emailHandler', error);
    }
  }
};

const loadTemplate = async (template) => {
  let templatePath = path.join(__dirname, `../templates/${ template }.html`);
  return await readFile(templatePath);
};

const prepareContents = (html, replacements) => {
  let template = handlebars.compile(html);
  return template(replacements);
};

const getMessageIdentifier = () => {

}