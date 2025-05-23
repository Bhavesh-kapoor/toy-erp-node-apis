import { sendResponse } from "#utils/response";
import QuotationService from "#services/quotation";
import httpStatus from "#utils/httpStatus";
import asyncHandler from "#utils/asyncHandler";

export const get = asyncHandler(async (req, res, next) => {
  const { id } = req.params;
  const filter = req.query;
  const data = await QuotationService.get(id, filter);
  sendResponse(httpStatus.OK, res, data, "Record fetched successfully");
});

export const getLimitedFields = asyncHandler(async (req, res, next) => {
  const fields = req.query;
  const data = await QuotationService.getLimitedFields(fields);
  sendResponse(httpStatus.OK, res, data, "Record fetched successfully");
});

export const getBaseFields = asyncHandler(async (req, res, next) => {
  const data = await QuotationService.getBaseFields();
  sendResponse(httpStatus.OK, res, data, "Record fetched successfully");
});

export const create = asyncHandler(async (req, res, next) => {
  const data = req.body;
  const createdData = await QuotationService.create(data);
  sendResponse(
    httpStatus.CREATED,
    res,
    createdData,
    "Record created successfully",
  );
});

export const sendQuotaion = asyncHandler(async (req, res, next) => {
  const { id } = req.params;
  await QuotationService.sendQuotation(id, req.body);
  sendResponse(httpStatus.OK, res, null, "Quotation sent successfully");
});

export const update = asyncHandler(async (req, res, next) => {
  const { id } = req.params;
  const data = req.body;
  const updatedData = await QuotationService.update(id, data);
  sendResponse(httpStatus.OK, res, updatedData, "Record updated successfully");
});

export const updateStatus = asyncHandler(async (req, res, next) => {
  const { id } = req.params;
  const data = req.body;
  const updatedData = await QuotationService.changeQuotationStatus(id, data);
  sendResponse(httpStatus.OK, res, updatedData, "Record updated successfully");
});

export const deleteData = asyncHandler(async (req, res, next) => {
  const { id } = req.params;
  await QuotationService.deleteDoc(id);
  sendResponse(httpStatus.NO_CONTENT, res, null, "Record deleted successfully");
});
