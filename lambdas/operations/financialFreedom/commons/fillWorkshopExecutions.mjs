import { calculateTiming } from './../../../workshops/handlers/execution/calculateWorkshopTiming.mjs';

export const fillWorkshopExecutions = (workshopExecutions) => {
  const todayWorkshopExecutions = {};
  workshopExecutions.forEach(workshopExecution => {
    if (workshopExecution.startTimestamp) {
      workshopExecution.timing = calculateTiming(workshopExecution);
      if (!todayWorkshopExecutions.current) {
        todayWorkshopExecutions.current = [];
      }
      todayWorkshopExecutions.current.push(workshopExecution);
    } else {
      if (!todayWorkshopExecutions.incoming) {
        todayWorkshopExecutions.incoming = [];
      }
      todayWorkshopExecutions.incoming.push(workshopExecution);
    }
  });

  return todayWorkshopExecutions;
};