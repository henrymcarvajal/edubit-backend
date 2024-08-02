import Repository from './repository.mjs';
import MentorTable from '../tables/mentorTable.mjs';
import { DmlOperators } from '../dml/dmlOperators.mjs';

import { findByCriteria } from '../dml/findByCriteria.mjs';

const MentorRepository = Object.create(Repository);

MentorRepository.table = MentorTable;

MentorRepository.findById = async function (id) {
  return findByCriteria(MentorRepository, ['id', DmlOperators.EQUALS, id]);
};

MentorRepository.findByIdIn = async function (ids) {
  return findByCriteria(this, ['id', DmlOperators.IN, ids]);
};

MentorRepository.findAll = async function () {
  return findByCriteria(this,['id', DmlOperators.NOT_NULL]);
};

MentorRepository.findByEmail = async function (email) {
  return findByCriteria(this,['email', DmlOperators.EQUALS, email]);
};

export default MentorRepository;