import { sendResponse } from "#utils/response";
import {
  getUsers,
  createUser,
  updateUser,
  deleteUser,
  enable2FA,
  loginUser,
} from "#services/user";
import status from "#utils/httpStatus";
import asyncHandler from "#utils/asyncHandler";

export const get = asyncHandler(async (req, res, next) => {
  const { id } = req.params;
  const filter = req.query;
  const data = await getUsers(id, filter);
  sendResponse(status.OK, res, data, "Record fetched successfully");
});

export const login = asyncHandler(async (req, res, next) => {
  const userData = req.body;
  const loginData = await loginUser(userData);
  sendResponse(status.OK, res, loginData, "Logged in successfully");
});

export const enabletwoFactorAuth = asyncHandler(async (req, res, next) => {
  const { id } = req.params;
  const twoFactorData = await enable2FA(id);
  res.send(`
      <html>
        <body>
          <h3>Scan the QR Code with your authenticator app</h3>
          <img src="${twoFactorData.qrCode}" alt="QR Code">
        </body>
      </html>
    `);
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
