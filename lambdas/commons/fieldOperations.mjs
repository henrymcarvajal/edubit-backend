export const setFields = (sourceObject, targetObject, ...fields) => {
  for (const field of fields) {
    setField(sourceObject, targetObject, field);
  }
};

export const setField = (sourceObject, targetObject, field) => {
  if (sourceObject.hasOwnProperty(field) && JSON.stringify(sourceObject[field]) !== JSON.stringify(targetObject[field])) {
    targetObject[field] = sourceObject[field];
    targetObject.modificationDate = new Date();
  }
};

export const disable = (sourceObject) => {
  sourceObject.enabled = false;
  sourceObject.disabledDate = new Date();
};