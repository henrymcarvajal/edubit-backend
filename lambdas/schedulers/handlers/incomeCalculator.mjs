import { extractBody } from '../../../client/aws/utils/bodyExtractor.mjs';
import { WorkshopExecutionRepository } from '../../../persistence/repositories/workshopExecutionRepository.mjs';
import { ParticipantProgressRepository } from '../../../persistence/repositories/participantProgressRepository.mjs';
import { ActivityRepository } from '../../../persistence/repositories/activityRepository.mjs';
import { WorkshopDefinitionRepository } from '../../../persistence/repositories/workshopDefinitionRepository.mjs';

let ALL_RULES;

exports.handle = async (event) => {
  try {
    const { body } = extractBody(event);

    const { id: workshopExecutionId } = JSON.parse(body.Message);

    await initializeRules(workshopExecutionId);

    const progresses = await ParticipantProgressRepository.findByWorkshopExecutionId(workshopExecutionId);

    progresses.forEach(prog => {
      console.log('prog', prog.details);
    });

    console.log(`Calculating income at ${ new Date() }`);

  } catch (error) {
    console.log(error);
  }

};

const initializeRules = async (workshopExecutionId) => {
  if (!ALL_RULES) {
    ALL_RULES = await WorkshopDefinitionRepository.findByWorkshopExecutionId(workshopExecutionId);
  }
};