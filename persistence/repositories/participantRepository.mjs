import Repository from './repository.mjs';
import ParticipantTable from '../tables/participantTable.mjs';
import { DmlOperators } from '../dml/dmlOperators.mjs';

import { findByCriteria } from '../dml/findByCriteria.mjs';

const ParticipantRepository = Object.create(Repository);

ParticipantRepository.table = ParticipantTable;

ParticipantRepository.findById = async function (id) {
  return findByCriteria(this, ['id', DmlOperators.EQUALS, id]);
};

ParticipantRepository.findByIdIn = async function (ids) {
  return findByCriteria(this, ['id', DmlOperators.IN, ids]);
};

ParticipantRepository.findByEmail = async function (email) {
  return findByCriteria(this, ['email', DmlOperators.EQUALS, email]);
};

export default ParticipantRepository;