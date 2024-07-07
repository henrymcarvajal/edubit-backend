import { HttpResponseCodes } from '../../../../commons/web/webResponses.mjs';
import { ParticipantRepository } from '../../../../persistence/repositories/participantRepository.mjs';
import { SignUpMessages } from './validations/messages.mjs';
import { UserRepository } from '../../../../persistence/repositories/userRepository.mjs';
import { UserRoles } from './constants.mjs';

import { checkDuplicateEmails, checkGrade } from './validations/validations.mjs';
import { checkMobileNumberFormat, validateEmail } from '../../../../util/generalValidations.mjs';
import { checkProps } from '../../../../util/propsGetter.mjs';
import { execOnDatabase } from '../../../../util/dbHelper.mjs';
import { handleEnrollmentError } from './errorHandling.mjs';
import { registerUserInCognito } from './cognito.mjs';
import { sendResponse } from '../../../../util/responseHelper.mjs';
import { validateCredentials } from './policies/credentialsPolicy.mjs';

const PARTICIPANT_PROPS = ['email', 'password', 'name', 'grade', 'parentEmail', 'parentPhone'];

export const handler = async (event) => {
  try {
    const data = await validateAndExtractParams(event);

    const user = createUser(data);
    await registerUserInCognito(user.email, data.password, UserRoles.PARTICIPANT);
    const savedUser = await saveUser(user);

    const participant = createParticipant(data, savedUser);
    await saveParticipant(participant);

    return sendResponse(HttpResponseCodes.OK, { message: SignUpMessages.USER_REGISTRATION_SUCCESSFUL });
  } catch (error) {
    return handleEnrollmentError(error);
  }
};

const validateAndExtractParams = async (event) => {
  const data = JSON.parse(event.body);
  checkProps(data, PARTICIPANT_PROPS);

  checkDuplicateEmails(data.email, data.parentEmail);
  checkMobileNumberFormat(data.parentPhone);

  await validateCredentials(data.email, data.password);
  await validateEmail(data.parentEmail);
  checkGrade(data.grade);

  return data;
};

const createUser = (data) => {
  const user = {};
  user.email = data.email.toLowerCase();
  user.roles = UserRoles.PARTICIPANT;
  user.creationDate = new Date();
  user.enabled = true;
  return user;
};

const saveUser = async (user) => {
  const { statement, entity } = UserRepository.insertStatement(user);
  const [savedUser] = await execOnDatabase({ statement, parameters: entity });
  return savedUser;
};

const createParticipant = (data, user) => {
  const participant = {};
  participant.userId = user.id;
  participant.email = data.email.toLowerCase();
  participant.name = data.name;
  participant.grade = data.grade;
  participant.parentEmail = data.parentEmail.toLowerCase();
  participant.parentPhone = data.parentPhone;
  return participant;
};

const saveParticipant = async (participant) => {
  const { statement, entity } = ParticipantRepository.insertStatement(participant);
  await execOnDatabase({ statement, parameters: entity });
};