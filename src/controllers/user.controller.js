import { sendResponse } from "#utils/response";
import UserService from "#services/user";
import httpStatus from "#utils/httpStatus";
import asyncHandler from "#utils/asyncHandler";

export const get = asyncHandler(async (req, res, next) => {
  const { id } = req.params;
  const filter = req.query;
  const data = await UserService.get(id, filter);
  sendResponse(httpStatus.OK, res, data, "Record fetched successfully");
});

export const getWithoutPagination = asyncHandler(async (req, res, next) => {
  const userData = await UserService.getWithoutPagination();
  sendResponse(httpStatus.OK, res, userData, "Record fetched successfully");
});

export const getCurrentUser = asyncHandler(async (req, res, next) => {
  const { user } = req;
  sendResponse(httpStatus.OK, res, user);
});

export const getUserByRole = asyncHandler(async (req, res, next) => {
  const { role } = req.params;
  const salesPersonData = await UserService.getUserByRole(role);
  sendResponse(
    httpStatus.OK,
    res,
    salesPersonData,
    "Record fetched successfully",
  );
});

export const login = asyncHandler(async (req, res, next) => {
  const userData = req.body;
  const loginData = await UserService.loginUser(userData);
  sendResponse(httpStatus.OK, res, loginData, "Logged in successfully");
});

export const forgotPass = asyncHandler(async (req, res, next) => {
  const userData = req.body;
  const otpData = await UserService.forgotPasswordRequest(userData);
  sendResponse(httpStatus.OK, res, otpData, "Otp sent successfully");
});

export const verifyPasswordResetOtp = asyncHandler(async (req, res, next) => {
  const otpData = req.body;
  const tokenData = await UserService.verifyOTP(otpData);
  sendResponse(httpStatus.OK, res, tokenData, "Otp verified successfully");
});

export const resetPass = asyncHandler(async (req, res, next) => {
  const userData = req.body;
  await UserService.changePassword(userData);
  sendResponse(httpStatus.OK, res, null, "Password changed successfully");
});

export const enabletwoFactorAuth = asyncHandler(async (req, res, next) => {
  const { id } = req.params;
  const twoFactorData = await UserService.enable2FA(id);
  res.send(`
      <html>
        <body>
          <h3>Scan the QR Code with your authenticator app</h3>
          <img src="${twoFactorData.qrCode}" alt="QR Code">
        </body>
      </html>
    `);
});

export const disableTwoFactorAuth = asyncHandler(async (req, res, next) => {
  const { id } = req.params;
  await UserService.disable2FA(id);
  sendResponse(httpStatus.OK, res, null, "2FA disabled successfully");
});

export const create = asyncHandler(async (req, res, next) => {
  const data = req.body;
  const createdData = await UserService.create(data);
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
  const updatedData = await UserService.update(id, data);
  sendResponse(httpStatus.OK, res, updatedData, "Record updated successfully");
});

export const deleteData = asyncHandler(async (req, res, next) => {
  const { id } = req.params;
  await UserService.deleteDoc(id);
  sendResponse(httpStatus.NO_CONTENT, res, null, "Record deleted successfully");
});
