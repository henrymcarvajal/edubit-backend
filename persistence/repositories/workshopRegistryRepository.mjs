import Repository from './repository.mjs';
import WorkshopRegistryTable from '../tables/workshopRegistryTable.mjs';
import { DmlOperators } from '../dml/dmlOperators.mjs';

import { findByCriteria } from '../dml/findByCriteria.mjs';

export const WorkshopRegistryRepository = Object.create(Repository);

WorkshopRegistryRepository.table = WorkshopRegistryTable;

WorkshopRegistryRepository.findById = async function (id) {
  return findByCriteria(this, ['id', DmlOperators.EQUALS, id]);
};

WorkshopRegistryRepository.findByWorkshopExecutionId = async function (id) {
  return findByCriteria(this, ['workshop_execution_id', DmlOperators.EQUALS, id]);
};

export default WorkshopRegistryRepository;