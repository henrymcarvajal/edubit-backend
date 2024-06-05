import { ParticipantProgressRepository } from '../../../../../persistence/repositories/participantProgressRepository.mjs';
import { InvalidRequestError } from '../../validations/error.mjs';

export const getParticipantProgress = async (participantId, workshopExecutionId) => {
  const [progress] = await ParticipantProgressRepository.findByParticipantIdAndWorkshopExecutionId(participantId, workshopExecutionId);
  if (!progress) {
    throw new InvalidRequestError(`Participant progress not found: ${ participantId }, ${ workshopExecutionId }`);
  }
  return progress;
};

