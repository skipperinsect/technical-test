// Utility for consistent logging
const logMessage = (level, message, id, error = null) => {
  console.log(`Request ID : ${id}`);

  const logOutput = `${level.toUpperCase()} - ${message}`;

  if (error) {
    console.error(`${logOutput} - Error: ${error.message}`);
  } else {
    console.log(logOutput);
  }
};

const ResponseSuccess = (
  req,
  res,
  data = {},
  message = "Success",
  status = 200
) => {
  logMessage("info", message, req.id);
  return res.status(status).json({
    request_id: req.id,
    success: true,
    message,
    data,
  });
};

const ResponseFailed = (
  req,
  res,
  error = null,
  message = "Request failed",
  status = 400
) => {
  logMessage("error", message, req.id, error);
  console.log(
    `${req.method} ${req.originalUrl} : ${error ? error.message : message}`
  );
  return res.status(status).json({
    request_id: req.id,
    success: false,
    message: message,
    data: null,
  });
};

module.exports = { ResponseFailed, ResponseSuccess };
