import { InternalServerError } from '../../../commons/errors/integrity/server.mjs';

export const getAuthorizationResult = (result) => {
  if (!result.body) {
    throw new InternalServerError(`A result could not be extracted from rule engine`);
  }

  const { authorize } = JSON.parse(result.body);
  return authorize;
};