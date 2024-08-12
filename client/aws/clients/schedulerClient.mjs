import { AwsInfo } from '../AwsInfo.mjs';

import { SchedulerClient } from "@aws-sdk/client-scheduler";

export const schedulerClient = new SchedulerClient({region: AwsInfo.REGION});