import Repository from './repository.mjs';
import UserModel, { User_UserMemberView } from '../tables/userModel.mjs';
import { DmlOperators } from '../dml/dmlOperators.mjs';

import { findByCriteria, findViewByCriteria } from '../dml/findByCriteria.mjs';

const UserRepository = Object.create(Repository);

UserRepository.table = UserModel;

UserRepository.findByEmail = async function (email) {
  return findByCriteria(this, ['email', DmlOperators.EQUALS, email]);
};

UserRepository.findViewByEmail = async function (email) {
  return findViewByCriteria(User_UserMemberView, ['email', DmlOperators.EQUALS, email]);
};

export default UserRepository;