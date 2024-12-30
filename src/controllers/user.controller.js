import { sendResponse } from "#utils/response";
import { getUsers, createUser, updateUser, deleteUser } from "#services/user";
import status from "#utils/httpStatus";
import asyncHandler from "#utils/asyncHandler";

export const get = asyncHandler(async (req, res, next) => {
  const { id } = req.params;
  const filter = req.query;
  const data = await getUsers(id, filter);
  sendResponse(status.OK, res, data, "Record fetched successfully");
});

export const create = asyncHandler(async (req, res, next) => {
  const data = req.body;
  const createdData = await createUser(data);
  sendResponse(status.CREATED, res, createdData, "Record created successfully");
});
export const update = asyncHandler(async (req, res, next) => {
  const { id } = req.params;
  const data = req.body;
  const updatedData = await updateUser(id, data);
  sendResponse(status.OK, res, updatedData, "Record updated successfully");
});
export const deleteData = asyncHandler(async (req, res, next) => {
  const { id } = req.params;
  await deleteUser(id);
  sendResponse(status.NO_CONTENT, res, null, "Record deleted successfully");
});
