export const sendErrorResponse = (statusCode, error) => {
    function replacer(key, value) {
        if (value?.constructor.name.includes('Error')) {
            return {
                name: value.name,
                message: value.message,
                stack: value.stack.replace(/\n/g,''),
                cause: value.cause,
            };
        }
        return value;
    }

    return {
        statusCode: statusCode,
        body: JSON.stringify(error, replacer, 10),
        headers: {
            'Content-Type': 'application/json',
            'Access-Control-Allow-Origin': '*',
            'Access-Control-Allow-Credentials': true,
            'Access-Control-Allow-Methods': '*'
        }
    }
}

export const sendResponse = (statusCode, body) => {
    return {
        statusCode: statusCode,
        body: JSON.stringify(body),
        headers: {
            'Content-Type': 'application/json',
            'Access-Control-Allow-Origin': '*',
            'Access-Control-Allow-Credentials': true,
            'Access-Control-Allow-Methods': '*'
        }
    }
}
