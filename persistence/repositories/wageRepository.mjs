import WagesTable from '../tables/wagesTable.mjs';
import Repository from './repository.mjs';
import { DmlOperators } from '../dml/dmlOperators.mjs';

import { findByCriteria } from '../dml/findByCriteria.mjs';

const WagesRepository = Object.create(Repository);

WagesRepository.table = WagesTable;

WagesRepository.findById = async function (id) {
  return findByCriteria(this, ['id', DmlOperators.EQUALS, id]);
};

WagesRepository.findAll = async function () {
  return findByCriteria(this, ['id', DmlOperators.NOT_NULL]);
};

WagesRepository.findAllEnabled = async function () {
  return findByCriteria(this, ['enabled', DmlOperators.EQUALS, true]);
};

export default WagesRepository;