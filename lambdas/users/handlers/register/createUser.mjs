import { UserRepository } from '../../../../persistence/repositories/userRepository.mjs';

import { extractBody } from '../../../../client/aws/utils/bodyExtractor.mjs';

export const handler = async (event) => {

  const user = extractBody(event);

  user.enabled = true;
  await UserRepository.upsert(user);
};
