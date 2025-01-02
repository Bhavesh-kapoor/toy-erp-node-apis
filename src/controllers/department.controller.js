import { sendResponse } from "#utils/response";
import {
  getDepartment,
  createDepartment,
  updateDepartment,
  deleteDepartment,
} from "#services/department";
import httpStatus from "#utils/httpStatus";
import asyncHandler from "#utils/asyncHandler";

export const get = asyncHandler(async (req, res, next) => {
  const { id } = req.params;
  const filter = req.query;
  const data = await getDepartment(id, filter);
  sendResponse(httpStatus.OK, res, data, "Record fetched successfully");
});

export const create = asyncHandler(async (req, res, next) => {
  const data = req.body;
  const createdData = await createDepartment(data);
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
  const updatedData = await updateDepartment(id, data);
  sendResponse(httpStatus.OK, res, updatedData, "Record updated successfully");
});
export const deleteData = asyncHandler(async (req, res, next) => {
  const { id } = req.params;
  await deleteDepartment(id);
  sendResponse(httpStatus.NO_CONTENT, res, null, "Record deleted successfully");
});
