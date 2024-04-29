export const objectToRow = (object, mappings) => {
  const entity = {};
  for (const [key, value] of Object.entries(mappings)) {
    if (object.hasOwnProperty(value) && object[value] !== null) {
      entity[key] = object[value];
    }
  }
  return entity;
};

export const rowToObject = (entity, mappings) => {
  const object = {};
  for (const [key, value] of Object.entries(mappings)) {
    if (entity.hasOwnProperty(key)  && entity[key] !== null) {
      object[value] = entity[key];
    }
  }
  return object;
};