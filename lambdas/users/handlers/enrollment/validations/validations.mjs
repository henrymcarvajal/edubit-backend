import { EmailsValidationMessages, GradeValidationMessages } from './messages.mjs';

import { DuplicateEmailsError, InvalidGradeError } from './error.mjs';

export const checkDuplicateEmails = (...emails) => {
  if (new Set(emails).size !== emails.length)
    throw new DuplicateEmailsError(EmailsValidationMessages.DUPLICATE_EMAILS);
};

export const checkGrade = (grade) => {
  if (grade < 6 || grade > 11)
    throw new InvalidGradeError(GradeValidationMessages.INVALID_GRADE);
};