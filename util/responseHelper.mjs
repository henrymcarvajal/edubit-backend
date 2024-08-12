export const sendResponse = (statusCode, response) => {
  return {
    statusCode,
    body: JSON.stringify(response, (response instanceof Error) ? replacer : null, 2),
    headers: responseHeaders
  };
};

const replacer = (key, value) => {
  if (value instanceof Error) {
    const { name, message, stack, cause } = value;
    return {
      name,
      message,
      stack: stack.replace(/\n/g, ''),
      cause,
    };
  }
  return value;
};

const responseHeaders = {
  'Content-Type': 'application/json',
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Credentials': true,
  'Access-Control-Allow-Methods': '*'
};

