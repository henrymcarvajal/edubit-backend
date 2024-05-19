export const AwsInfo = {
  REGION: process.env.aws_region,
  COMMONS_DATABASE_LAMBDA: process.env.commons_database_lambda,
  COMMONS_DATABASE_QUEUE: process.env.commons_database_queue,
  SCHEDULERS_TARGET_QUEUE_ARN: process.env.schedulers_target_queue_arn,
  SCHEDULERS_EXECUTION_ROLE_ARN: process.env.schedulers_execution_role_arn,
  TIMER_NOTIFICATION_TOPIC_ARN: process.env.timer_notification_topic_arn,
  CLEAN_SCHEDULER_TOPIC_NAME: process.env.clean_scheduler_topic_name,
  WORKSHOPS_TOPIC_NAME: process.env.workshops_topic_name
}
