import Repository from './repository.mjs';
import InstitutionTable from '../tables/institutionTable.mjs';
import { DmlOperators } from '../dml/dmlOperators.mjs';

import { findByCriteria } from '../dml/findByCriteria.mjs';

const InstitutionRepository = Object.create(Repository);

InstitutionRepository.table = InstitutionTable;

InstitutionRepository.findById = async function (id) {
  return findByCriteria(this,['id', DmlOperators.EQUALS, id]);
};

InstitutionRepository.findAll = async function () {
  return findByCriteria(this,['id', DmlOperators.NOT_NULL]);
};

InstitutionRepository.findAllEnabled = async function () {
  return findByCriteria(this,['enabled', DmlOperators.EQUALS, true]);
};

export default InstitutionRepository;