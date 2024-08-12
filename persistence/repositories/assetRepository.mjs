import Repository from './repository.mjs';
import AssetTable from '../tables/assetTable.mjs';
import { DmlOperators } from '../dml/dmlOperators.mjs';

import { findByCriteria } from '../dml/findByCriteria.mjs';

const AssetRepository = Object.create(Repository);

AssetRepository.table = AssetTable;

AssetRepository.findById = async function (id) {
  return findByCriteria(this, ['id', DmlOperators.EQUALS, id]);
};

AssetRepository.findByIdIn = async function (ids) {
  return findByCriteria(this, ['id', DmlOperators.IN, ids]);
};

AssetRepository.findByIdInAndEnabled = async function (ids) {
  return findByCriteria(this,
      ['id', DmlOperators.IN, ids],
      ['enabled', DmlOperators.EQUALS, true]
  );
};

AssetRepository.findAll = async function () {
  return findByCriteria(this, ['id', DmlOperators.NOT_NULL]);
};

AssetRepository.findAllEnabled = async function () {
  return findByCriteria(this, ['enabled', DmlOperators.EQUALS, true]);
};

export default AssetRepository;