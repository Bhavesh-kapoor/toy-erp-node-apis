export const sendResponse = (statusCode, res, data, message) => {
  const status = statusCode >= 400 ? false : true;
  res
    .status(statusCode)
    .json({ status, ...(message ? { message } : null), data });
};
