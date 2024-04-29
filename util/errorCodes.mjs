export const ErrorCodeType = function (id, label, sortOrder, message, httpStatusCode) {
    this.id = parseInt(id, 10);
    this.label = label;
    this.sort_order = parseInt(sortOrder, 10);
    this.message = message;
    this.http_status_code = parseInt(httpStatusCode, 10);
  };

export let ErrorCodes = {
    ERRORCODE_400: new ErrorCodeType(400, 'ERRORCODE_400', 1, 'Bad request', 400),
    ERRORCODE_401: new ErrorCodeType(401, 'ERRORCODE_401', 2, 'Not authorized', 401),
    ERRORCODE_403: new ErrorCodeType(403, 'ERRORCODE_403', 3, 'Forbidden', 403),
    ERRORCODE_500: new ErrorCodeType(500, 'ERRORCODE_500', 4, 'Server error', 500),
    ERRORCODE_600: new ErrorCodeType(600, 'ERRORCODE_600', 5, 'DB Error', 500),
    ERRORCODE_701: new ErrorCodeType(701, 'ERRORCODE_701', 6, 'No Internet connection', 500)
  };