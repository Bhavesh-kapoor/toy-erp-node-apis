import { session } from "#middlewares/session";

export const sendResponse = async (statusCode, res, data, message) => {
  const status = statusCode >= 400 ? false : true;
  const transactionSession = session.get("transaction");
  if (transactionSession) {
    status
      ? await transactionSession.commitTransaction()
      : await transactionSession.abortTransaction;
  }

  //const pagination = {
  //  currentPage: pageNumber,
  //  totalItems: totalResuts,
  //  itemsPerPage: limitNumber,
  //  totalPages: Math.ceil(totalResuts / limitNumber),
  //};

  res
    .status(statusCode)
    .json({ status, ...(message ? { message } : null), data });
};
