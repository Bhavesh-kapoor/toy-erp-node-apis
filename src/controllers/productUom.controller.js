import httpStatus from "#utils/httpStatus";
import { sendResponse } from "#utils/response";
import asyncHandler from "#utils/asyncHandler";
import ProductUomService from "#services/productUom";

export const get = asyncHandler(async (req, res, next) => {
  const { id } = req.params;
  const filter = req.query;
  const data = await ProductUomService.get(id, filter);
  sendResponse(httpStatus.OK, res, data, "Record fetched successfully");
});

export const create = asyncHandler(async (req, res, next) => {
  const data = req.body;
  const createdData = await ProductUomService.create(data);
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
  const updatedData = await ProductUomService.update(id, data);
  sendResponse(httpStatus.OK, res, updatedData, "Record updated successfully");
});

export const deleteData = asyncHandler(async (req, res, next) => {
  const { id } = req.params;
  await ProductUomService.deleteDoc(id);
  sendResponse(httpStatus.NO_CONTENT, res, null, "Record deleted successfully");
});
