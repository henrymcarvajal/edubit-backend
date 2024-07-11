import { ParticipantProgressRepository } from '../../../../persistence/repositories/participantProgressRepository.mjs';
import { ResourceNotFoundError } from '../../../commons/errors/integrity/resources.mjs';

export const getParticipantProgress = async (participantId, workshopExecutionId) => {
  const [progress] = await ParticipantProgressRepository.findByParticipantIdAndWorkshopExecutionId(participantId, workshopExecutionId);
  if (!progress) {
    throw new ResourceNotFoundError(`Participant progress not found: ${ participantId }, ${ workshopExecutionId }`);
  }
  return progress;
};

