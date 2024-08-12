import { DmlOperators } from '../dml/dmlOperators.mjs';
import ParticipantProgressTable, {
  ParticipantProgressTable_CurrentActivityView, ParticipantProgressTable_ParticipantView
} from '../tables/participantProgressTable.mjs';

import Repository from './repository.mjs';
import { findByCriteria, findViewByCriteria } from '../dml/findByCriteria.mjs';

const ParticipantProgressRepository = Object.create(Repository);

ParticipantProgressRepository.table = ParticipantProgressTable;

ParticipantProgressRepository.findById = async function (id) {
  return findByCriteria(this, ['id', DmlOperators.EQUALS, id]);
};

ParticipantProgressRepository.findByParticipantIdAndWorkshopExecutionId = async function (participantId, workshopExecutionId) {
  return findByCriteria(this,
      ['participant_id', DmlOperators.EQUALS, participantId],
      ['workshop_execution_id', DmlOperators.EQUALS, workshopExecutionId]
  );
};

ParticipantProgressRepository.findByParticipantIdInAndWorkshopExecutionId = async function (participantIds, workshopExecutionId) {
  return findByCriteria(this,
      ['participant_id', DmlOperators.IN, participantIds],
      ['workshop_execution_id', DmlOperators.EQUALS, workshopExecutionId]
  );
};

ParticipantProgressRepository.findByWorkshopExecutionId = async function (workshopExecutionId) {
  return findByCriteria(this, ['workshop_execution_id', DmlOperators.EQUALS, workshopExecutionId]
  );
};

ParticipantProgressRepository.findByWorkshopExecutionIdWithParticipantView = async function (workshopExecutionId) {
  return findViewByCriteria(
      ParticipantProgressTable_ParticipantView,
      ['workshop_execution_id', DmlOperators.EQUALS, workshopExecutionId]
  );
};

ParticipantProgressRepository.findCurrentActivityByParticipantIdAndWorkshopExecutionId = async function (workshopExecutionId, participantId) {
  return findViewByCriteria(
      ParticipantProgressTable_CurrentActivityView,
      ['participant_id', DmlOperators.EQUALS, participantId],
      ['workshop_execution_id', DmlOperators.EQUALS, workshopExecutionId]
  );
};

export default ParticipantProgressRepository;