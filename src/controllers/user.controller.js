import { sendResponse } from "#utils/response";
import {
  getUsers,
  createUser,
  updateUser,
  deleteUser,
  loginUser,
} from "#services/user";
import httpStatus from "#utils/httpStatus";
import asyncHandler from "#utils/asyncHandler";

export const get = asyncHandler(async (req, res, next) => {
  const { id } = req.params;
  const filter = req.query;
  const data = await getUsers(id, filter);
  sendResponse(httpStatus.OK, res, data, "Record fetched successfully");
});

export const login = asyncHandler(async (req, res, next) => {
  const userData = req.body;
  const loggedInData = await loginUser(userData);
  sendResponse(
    httpStatus.OK,
    res,
    { token: loggedInData },
    "Logged In successfully",
  );
});

export const create = asyncHandler(async (req, res, next) => {
  const data = req.body;
  const createdData = await createUser(data);
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
  const updatedData = await updateUser(id, data);
  sendResponse(httpStatus.OK, res, updatedData, "Record updated successfully");
});
export const deleteData = asyncHandler(async (req, res, next) => {
  const { id } = req.params;
  await deleteUser(id);
  sendResponse(httpStatus.NO_CONTENT, res, null, "Record deleted successfully");
});
