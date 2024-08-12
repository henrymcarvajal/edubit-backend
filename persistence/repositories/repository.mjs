import { dmlOperations } from '../dml/dmlOperations.mjs';

const Repository = {

  selectStatement(columns, operators) {
    return dmlOperations.selectStatement(this.table, columns, operators);
  },

  insertStatement(object) {
    return dmlOperations.insertStatement(this.table, object);
  },

  upsertStatement(object) {
    return dmlOperations.upsertStatement(this.table, object);
  },

  findByCriteria(...criteria) {
    return dmlOperations.findByCriteria(this, ...criteria);
  }
};

export default Repository;