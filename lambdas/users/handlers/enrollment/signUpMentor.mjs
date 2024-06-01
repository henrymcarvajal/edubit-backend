import { DmlOperators } from '../../../../persistence/dml/dmlOperators.mjs';
import { HttpResponseCodes } from '../../../../commons/web/webResponses.mjs';
import { MentorRepository } from '../../../../persistence/repositories/mentorRepository.mjs';
import { SignUpMessages } from './validations/messages.mjs';
import { UserRepository } from '../../../../persistence/repositories/userRepository.mjs';
import { UserRoles } from './constants.mjs';

import { checkMobileNumberFormat } from '../../../../util/generalValidations.mjs';
import { checkProps } from '../../../../util/propsGetter.mjs';
import { execOnDatabase } from '../../../../util/dbHelper.mjs';
import { handleEnrollmentError } from './errorHandling.mjs';
import { registerUserInCognito } from './cognito.mjs';
import { sendResponse } from '../../../../util/responseHelper.mjs';
import { validateActivities } from '../../../commons/validations/validations.mjs';
import { validateCredentials } from './policies/credentialsPolicy.mjs';

const MENTOR_PROPS = ['email', 'password', 'name', 'phone'];

const createUser = (data) => {
  const user = {};
  user.email = data.email.toLowerCase();
  user.roles = UserRoles.MENTOR;
  user.creationDate = new Date();
  user.enabled = true;
  return user;
};

const createMentor = (data, user) => {
  const mentor = {};
  mentor.userId = user.id;
  mentor.email = data.email.toLowerCase();
  mentor.name = data.name;
  mentor.phone = data.phone;
  mentor.activities = data.activities;
  return mentor;
};

export const handler = async (event) => {

  try {
    const data = JSON.parse(event.body);
    checkProps(data, MENTOR_PROPS);

    checkMobileNumberFormat(data.phone);
    await validateCredentials(data.email, data.password);

    const [phoneInDB] = await MentorRepository.findByCriteria(
        ['phone', DmlOperators.EQUALS, data.phone]
    );
    if (phoneInDB) {
      return sendResponse(HttpResponseCodes.INTERNAL_SERVER_ERROR, {message: SignUpMessages.PHONE_ALREADY_EXISTS});
    }

    if (data.activities) await validateActivities(data.activities);

    const user = createUser(data);

    await registerUserInCognito(user.email, data.password, UserRoles.MENTOR);

    const {statement: userStatement, entity: userEntity} = UserRepository.insertStatement(user);
    const [savedUser] = await execOnDatabase([{statement: userStatement, parameters: userEntity}]);

    const mentor = createMentor(data, savedUser);

    const {statement: mentorStatement, entity: mentorEntity} = MentorRepository.insertStatement(mentor);

    await execOnDatabase([{statement: mentorStatement, parameters: mentorEntity}]);

    return sendResponse(HttpResponseCodes.OK, {message: SignUpMessages.USER_REGISTRATION_SUCCESSFUL});

  } catch (error) {
    return handleEnrollmentError(error);
  }
};