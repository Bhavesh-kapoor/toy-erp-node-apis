import httpStatus from "#utils/httpStatus";
import asyncHandler from "#utils/asyncHandler";
import DashboardService from "#services/dashboard";
import { sendResponse } from "#utils/response";

export const get = asyncHandler(async (req, res, next) => {
  const data = await DashboardService.get(req.query);
  sendResponse(httpStatus.OK, res, data, "Data fetched successfully");
});

export const getExpenseData = asyncHandler(async (req, res, next) => {
  const data = await DashboardService.getExpenseData(req.query);
  sendResponse(httpStatus.OK, res, data, "Data fetched successfully");
});

export const getQuotationData = asyncHandler(async (req, res, next) => {
  const data = await DashboardService.getQuotationData(req.query);
  sendResponse(httpStatus.OK, res, data, "Data fetched successfully");
});

export const getBillingData = asyncHandler(async (req, res, next) => {
  const data = await DashboardService.getBillingData(req.query);
  sendResponse(httpStatus.OK, res, data, "Data fetched successfully");
});

export const getLedgerData = asyncHandler(async (req, res, next) => {
  const data = await DashboardService.getLedgerData(req.query);
  sendResponse(httpStatus.OK, res, data, "Data fetched successfully");
});
