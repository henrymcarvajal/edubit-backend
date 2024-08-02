import Repository from './repository.mjs';
import { DmlOperators } from '../dml/dmlOperators.mjs';
import WorkshopExecutionTable from '../tables/workshopExecutionModel.mjs';
import {
  WorkshopExecution_InstitutionView,
  WorkshopExecution_ScheduleView,
  WorkshopExecution_DefinitionView, WorkshopExecution_FullDefinitionView
} from '../tables/workshopExecutionModel.mjs';

import { findByCriteria, findViewByCriteria } from '../dml/findByCriteria.mjs';
import { getRangeForToday, getAYearFromToday, getTomorrowAtMidnight } from '../../util/dates.js';

const WorkshopExecutionRepository = Object.create(Repository);
WorkshopExecutionRepository.table = WorkshopExecutionTable;

WorkshopExecutionRepository.findById = async function (id) {
  return findByCriteria(this, ['id', DmlOperators.EQUALS, id]);
};

WorkshopExecutionRepository.findByIdIn = async function (ids) {
  return findByCriteria(this, ['id', DmlOperators.IN, ids]);
};

WorkshopExecutionRepository.findByInstitutionId = async function (id) {
  return findViewByCriteria(WorkshopExecution_InstitutionView, ['id', DmlOperators.EQUALS, id]);
};

WorkshopExecutionRepository.findForToday = async function () {
  const [startOfDay, endOfDay] = getRangeForToday();

  console.log('startOfDay', startOfDay)
  console.log('endOfDay', endOfDay)

  return findViewByCriteria(
      WorkshopExecution_FullDefinitionView,
      ['scheduled_date', DmlOperators.GREATER_THAN_OR_EQUAL_TO, startOfDay],
      ['scheduled_date', DmlOperators.LESS_THAN, endOfDay],
      ['end_timestamp', DmlOperators.NULL],
  );
};

WorkshopExecutionRepository.findIncoming = async function () {
  const tomorrowAtMidnight = getTomorrowAtMidnight();
  const aYearFromToday = getAYearFromToday();

  return findViewByCriteria(
      WorkshopExecution_FullDefinitionView,
      ['scheduled_date', DmlOperators.GREATER_THAN_OR_EQUAL_TO, tomorrowAtMidnight],
      ['scheduled_date', DmlOperators.LESS_THAN, aYearFromToday],
      ['end_timestamp', DmlOperators.NULL],
  );
};

WorkshopExecutionRepository.findScheduleById = async function (id) {
  return findViewByCriteria(WorkshopExecution_ScheduleView, ['id', DmlOperators.EQUALS, id]);
};

WorkshopExecutionRepository.findEnrollmentByParticipantId = async function (id) {
  return findViewByCriteria(WorkshopExecution_DefinitionView,
      ['participants', DmlOperators.HAS_AS_TOP_LEVEL_KEY, id],
      ['scheduled_date', DmlOperators.GREATER_THAN_OR_EQUAL_TO, new Date(new Date().toISOString().slice(0, 10))]
  );
};

WorkshopExecutionRepository.findAll = async function () {
  return findByCriteria(this, ['id', DmlOperators.NOT_NULL]);
};

export default WorkshopExecutionRepository;

