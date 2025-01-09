import { sendResponse } from "#utils/response";
import CurrencyService from "#services/currency";
import httpStatus from "#utils/httpStatus";
import asyncHandler from "#utils/asyncHandler";

export const get = asyncHandler(async (req, res, _next) => {
  const { id } = req.params;
  const filter = req.query;
  const data = await CurrencyService.get(id, filter);
  sendResponse(httpStatus.OK, res, data, "Record fetched successfully");
});

export const create = asyncHandler(async (req, res, _next) => {
  const data = req.body;
  const createdData = await CurrencyService.create(data);
  sendResponse(
    httpStatus.CREATED,
    res,
    createdData,
    "Record created successfully",
  );
});
export const update = asyncHandler(async (req, res, _next) => {
  const { id } = req.params;
  const data = req.body;
  const updatedData = await CurrencyService.update(id, data);
  sendResponse(httpStatus.OK, res, updatedData, "Record updated successfully");
});
export const deleteData = asyncHandler(async (req, res, _next) => {
  const { id } = req.params;
  await CurrencyService.deleteData(id);
  sendResponse(httpStatus.NO_CONTENT, res, null, "Record deleted successfully");
});
