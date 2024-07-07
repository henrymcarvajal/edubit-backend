import { validateActivities } from './activities.mjs';
import { crossCheckActivities } from '../../members/validations/activityChecks.mjs';

export const validateEnrollmentActivities = async (enrollmentActivities, workshopExecutionActivities) => {
  await validateActivities(enrollmentActivities);
  crossCheckActivities(Object.values(enrollmentActivities), Object.values(workshopExecutionActivities));
}