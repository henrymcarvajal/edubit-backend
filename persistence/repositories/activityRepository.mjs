import Repository from './repository.mjs';
import ActivityTable from '../tables/activityTable.mjs';
import { DmlOperators } from '../dml/dmlOperators.mjs';

import { findByCriteria } from '../dml/findByCriteria.mjs';

const ActivityRepository = Object.create(Repository);

ActivityRepository.table = ActivityTable;

ActivityRepository.findById = async function (id) {
  return findByCriteria(this, ['id', DmlOperators.EQUALS, id]);
};

ActivityRepository.findByIdIn = async function (ids) {
  return findByCriteria(this, ['id', DmlOperators.IN, ids]);
};

ActivityRepository.findByIdInEnabled = async function (ids) {
  return findByCriteria(this,
      ['id', DmlOperators.IN, ids],
      ['enabled', DmlOperators.EQUALS, true]
  );
};

ActivityRepository.findAll = async function () {
  return findByCriteria(this, ['id', DmlOperators.NOT_NULL]);
};

ActivityRepository.findAllEnabled = async function () {
  return findByCriteria(this, ['enabled', DmlOperators.EQUALS, true]);
};

export default ActivityRepository;