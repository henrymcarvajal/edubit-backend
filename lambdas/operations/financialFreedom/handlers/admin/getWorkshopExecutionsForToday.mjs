import WorkshopExecutionRepository from '../../../../../persistence/repositories/workshopExecutionRepository.mjs';
import { HttpResponseCodes } from '../../../../../commons/web/webResponses.mjs';

import { arrayIsEmpty } from '../../../../../util/arrays.mjs';
import { authorizeAdmin } from '../../../../members/authorizers/adminAuthorizer.mjs';
import { fillWorkshopExecutions } from '../../commons/fillWorkshopExecutions.mjs';
import { handleErrorResponse } from '../../../../commons/errorHandling.mjs';
import { sendResponse } from '../../../../../util/responseHelper.mjs';

import { ResourceNotFoundError } from '../../../../commons/errors/integrity/resources.mjs';

exports.handle = async (event) => {
  try {
    authorizeAdmin(event);

    const workshopExecutions = await fetchWorkshops();
    const todayWorkshopExecutions = fillWorkshopExecutions(workshopExecutions);

    return sendResponse(HttpResponseCodes.OK, todayWorkshopExecutions);
  } catch (error) {
    return handleErrorResponse(error);
  }
};

const fetchWorkshops = async () => {
  const workshopExecutions = await WorkshopExecutionRepository.findForToday();
  if (arrayIsEmpty(workshopExecutions)) {
    throw new ResourceNotFoundError('No workshops for today');
  }
  return workshopExecutions;
};