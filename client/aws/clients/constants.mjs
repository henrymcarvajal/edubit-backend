export const AwsInfo = {
  REGION: process.env.aws_region,
  COMMONS_DATABASE_LAMBDA: process.env.commons_database_lambda,
  COMMONS_DATABASE_QUEUE: process.env.commons_database_queue,
  COMMONS_EMAIL_QUEUE: process.env.commons_email_queue,
  COMMONS_SMS_QUEUE: process.env.commons_sms_queue,
  NEQUI_PUSH_QUEUE: process.env.nequi_push_queue,
  PAYMENT_QUERY_QUEUE: process.env.payment_query_queue,
  DISBURSEMENTS_QUEUE: process.env.disbursements_queue,
  CAMPAIGNS_TOPIC: process.env.campaigns_topic_arn,
  FRONTEND_URL: process.env.frontend_url
}
