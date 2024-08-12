import { checkProps } from '../../../util/propsGetter.mjs';
import { InvalidInputError } from '../../commons/errors/data/input.mjs';

export const validateWorkshopDefinitionData = (workshopDefinition, props) => {
  checkProps(workshopDefinition, props);

  let keys = Object.keys(workshopDefinition.schedule);
  if (keys.length === 0) {
    throw new InvalidInputError('Missing activities data');
  }

  let activityProps = ['duration', 'description'];
  keys.forEach((key) => {
    const activity = workshopDefinition.schedule[key];
    checkProps(activity, activityProps);
    if (typeof activity.duration !== 'number') {
      throw new InvalidInputError(`duration should be a number: ${ activity.duration }`);
    }
  });
};