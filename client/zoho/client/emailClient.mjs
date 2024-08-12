import nodemailer from 'nodemailer';
import { ZohoInfo } from '../zohoInfo.mjs';

let mailer = nodemailer.createTransport({
  host: ZohoInfo.EMAIL_HOST,
  secureConnection: true,
  port: ZohoInfo.SMTP_PORT,
  auth: {
    user: ZohoInfo.EMAIL_USERNAME,
    pass: ZohoInfo.EMAIL_PASSWORD
  },
  tls: {
    secureProtocol: 'TLSv1_method'
  }
});

export const sendEmail = async (addresses, subject, body, attachments) => {
  let mailOptions = {
    from: ZohoInfo.EMAIL_USERNAME,
    to: addresses,
    subject: subject,
    html: body
  };

  if (attachments) {
    mailOptions['attachments'] = attachments.map((attachment) => {
      return {
        filename: attachment.filename,
        content: attachment.stringBase64,
        encoding: 'base64'
      };
    });
  }

  const response = await new Promise((resolve, reject) => {
    mailer.sendMail(mailOptions, (error, info) => {
      if (error) {
        reject(error);
      }
      resolve(info);
    });
  });

  console.log('response', response);

  return response;
};