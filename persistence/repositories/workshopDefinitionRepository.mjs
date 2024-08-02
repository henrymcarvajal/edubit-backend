import Repository from './repository.mjs';
import { DmlOperators } from '../dml/dmlOperators.mjs';
import WorkshopDefinitionTable, {
  WorkshopDefinition_WorkshopExecutionView
} from '../tables/workshopDefinitionTable.mjs';
import { findByCriteria, findViewByCriteria } from '../dml/findByCriteria.mjs';


const WorkshopDefinitionRepository = Object.create(Repository);

WorkshopDefinitionRepository.table = WorkshopDefinitionTable;

WorkshopDefinitionRepository.findById = async function (id) {
  return findByCriteria(this,['id', DmlOperators.EQUALS, id]);
};

WorkshopDefinitionRepository.findByWorkshopExecutionId = async function (id) {
  return findViewByCriteria(WorkshopDefinition_WorkshopExecutionView, ['id', DmlOperators.EQUALS, id]);
};

export default WorkshopDefinitionRepository;