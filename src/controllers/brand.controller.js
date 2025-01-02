import { sendResponse } from "#utils/response";
import {
  getBrand,
  createBrand,
  updateBrand,
  deleteBrand,
} from "#services/brand";
import httpStatus from "#utils/httpStatus";
import asyncHandler from "#utils/asyncHandler";

export const get = asyncHandler(async (req, res, next) => {
  const { id } = req.params;
  const filter = req.query;
  const data = await getBrand(id, filter);
  sendResponse(httpStatus.OK, res, data, "Record fetched successfully");
});

export const create = asyncHandler(async (req, res, next) => {
  const data = req.body;
  const createdData = await createBrand(data);
  sendResponse(
    httpStatus.CREATED,
    res,
    createdData,
    "Record created successfully",
  );
});
export const update = asyncHandler(async (req, res, next) => {
  const { id } = req.params;
  const data = req.body;
  const updatedData = await updateBrand(id, data);
  sendResponse(httpStatus.OK, res, updatedData, "Record updated successfully");
});
export const deleteData = asyncHandler(async (req, res, next) => {
  const { id } = req.params;
  await deleteBrand(id);
  sendResponse(httpStatus.NO_CONTENT, res, null, "Record deleted successfully");
});
