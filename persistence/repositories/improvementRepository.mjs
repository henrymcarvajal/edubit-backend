import Repository from './repository.mjs';
import ImprovementTable from '../tables/improvementTable.mjs';
import { DmlOperators } from '../dml/dmlOperators.mjs';

import { findByCriteria } from '../dml/findByCriteria.mjs';

const ImprovementRepository = Object.create(Repository);

ImprovementRepository.table = ImprovementTable;

ImprovementRepository.findById = async function (id) {
  return findByCriteria(this, ['id', DmlOperators.EQUALS, id]);
};

ImprovementRepository.findByIdIn = async function (ids) {
  return findByCriteria(this, ['id', DmlOperators.IN, ids]);
};

ImprovementRepository.findAll = async function () {
  return findByCriteria(this, ['id', DmlOperators.NOT_NULL]);
};

ImprovementRepository.findAllEnabled = async function () {
  return findByCriteria(this, ['enabled', DmlOperators.EQUALS, true]);
};

export default ImprovementRepository;