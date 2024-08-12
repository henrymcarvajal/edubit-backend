const endedPhase = { description: 'End of event' };

export const calculateTiming = (workshopExecution) => {

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
        nextPhase = endedPhase;
      }
      break;
    }
  }

  if (workshopExecution.remainingTime === 0) {
    return { currentPhase: endedPhase };
  }

  return {
    currentPhase: currentPhase,
    nextPhase: nextPhase,
    nextPhaseInMinutes: sumUp - workshopExecution.elapsedTime,
    elapsedTime: workshopExecution.elapsedTime,
    remainingTime: workshopExecution.remainingTime
  };
};
