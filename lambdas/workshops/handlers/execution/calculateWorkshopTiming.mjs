export const calculateTiming = (workshopExecution) => {

  console.log('workshopExecution', JSON.stringify(workshopExecution));

  let currentPhase;
  let nextPhase;
  let sumUp = 0;
  let entries = Object.entries(workshopExecution.schedule);
  for (let i = 0; i < entries.length; i++) {
    sumUp += entries[i][1].duration;
    if (sumUp >= workshopExecution.elapsedTime) {
      currentPhase = workshopExecution.schedule[entries[i][0]];
      if (i + 1 < entries.length) {
        nextPhase = workshopExecution.schedule[entries[i + 1][0]];
      } else {
        nextPhase = { description: 'End of event' };
      }
      break;
    }
  }

  return {
    currentPhase: currentPhase,
    nextPhase: nextPhase,
    nextPhaseInMinutes: sumUp - workshopExecution.elapsedTime,
    elapsedTime: workshopExecution.elapsedTime,
    remainingTime: workshopExecution.remainingTime
  };
};