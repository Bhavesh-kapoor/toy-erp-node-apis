import { sendResponse } from "#utils/response";
import BrandService from "#services/brand";
import httpStatus from "#utils/httpStatus";
import asyncHandler from "#utils/asyncHandler";

export const get = asyncHandler(async (req, res, next) => {
  const { id } = req.params;
  const filter = req.query;
  const data = await BrandService.get(id, filter);
  sendResponse(httpStatus.OK, res, data, "Record fetched successfully");
});

export const getLimitedFields = asyncHandler(async (req, res, next) => {
  const fields = req.query;
  const data = await BrandService.getSelectedBrands(fields);
  sendResponse(httpStatus.OK, res, data, "Record fetched successfully");
});

export const create = asyncHandler(async (req, res, next) => {
  const data = req.body;
  const createdData = await BrandService.create(data);
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
  const updatedData = await BrandService.update(id, data);
  sendResponse(httpStatus.OK, res, updatedData, "Record updated successfully");
});

export const deleteData = asyncHandler(async (req, res, next) => {
  const { id } = req.params;
  await BrandService.deleteDoc(id);
  sendResponse(httpStatus.NO_CONTENT, res, null, "Record deleted successfully");
});
