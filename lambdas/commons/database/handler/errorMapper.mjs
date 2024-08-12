export const DatabaseErrorType = {
  INTEGRITY_CONSTRAINT_VIOLATION: 'INTEGRITY_CONSTRAINT_VIOLATION', // Class 23 — Integrity Constraint Violation
  SYNTAX_ERROR_OR_ACCESS_RULE_VIOLATION: 'SYNTAX_ERROR_OR_ACCESS_RULE_VIOLATION', // Class 42 — Syntax Error or Access Rule Violation
  OTHER: 'OTHER'
};

export const databaseErrorMapper = (errorCode) => {
  switch (errorCode) {
    case '23000': //	integrity_constraint_violation
    case '23001': //	restrict_violation
    case '23502': //	not_null_violation
    case '23503': //	foreign_key_violation
    case '23505': //	unique_violation
    case '23514': //	check_violation
    case '23P01': //	exclusion_violation
      return DatabaseErrorType.INTEGRITY_CONSTRAINT_VIOLATION;
    case '42804': // datatype_mismatch
    case '42601': // syntax_error'
    case '42P01':	// undefined_table
      return DatabaseErrorType.SYNTAX_ERROR_OR_ACCESS_RULE_VIOLATION;
    default:
      return DatabaseErrorType.OTHER; // Unidentified error
  }
};
