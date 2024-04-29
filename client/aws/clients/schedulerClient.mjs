import { AwsInfo } from './constants.mjs';

import { SchedulerClient } from "@aws-sdk/client-scheduler";

export const schedulerClient = new SchedulerClient({region: AwsInfo.REGION});