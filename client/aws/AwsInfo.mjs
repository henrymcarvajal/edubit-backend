export const AwsInfo = {
  REGION: process.env.aws_region,
  COMMONS_DATABASE_LAMBDA: process.env.commons_database_lambda,
  COMMONS_DATABASE_QUEUE: process.env.commons_database_queue,
  SCHEDULERS_TARGET_QUEUE_ARN: process.env.schedulers_target_queue_arn,
  SCHEDULERS_EXECUTION_ROLE_ARN: process.env.schedulers_execution_role_arn
}
