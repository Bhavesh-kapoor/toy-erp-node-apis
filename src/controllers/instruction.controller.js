import { sendResponse } from "#utils/response";
import {
  getInstruction,
  createInstruction,
  updateInstruction,
  deleteInstruction,
} from "#services/instruction";
import httpStatus from "#utils/httpStatus";
import asyncHandler from "#utils/asyncHandler";

export const get = asyncHandler(async (req, res, next) => {
  const { id } = req.params;
  const filter = req.query;
  const data = await getInstruction(id, filter);
  sendResponse(httpStatus.OK, res, data, "Record fetched successfully");
});

export const create = asyncHandler(async (req, res, next) => {
  const data = req.body;
  const createdData = await createInstruction(data);
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
  const updatedData = await updateInstruction(id, data);
  sendResponse(httpStatus.OK, res, updatedData, "Record updated successfully");
});
export const deleteData = asyncHandler(async (req, res, next) => {
  const { id } = req.params;
  await deleteInstruction(id);
  sendResponse(httpStatus.NO_CONTENT, res, null, "Record deleted successfully");
});
