import { sendResponse } from "#utils/response";
import WarehouseService from "#services/warehouse";
import httpStatus from "#utils/httpStatus";
import asyncHandler from "#utils/asyncHandler";

export const get = asyncHandler(async (req, res, next) => {
  const { id } = req.params;
  const filter = req.query;
  const data = await WarehouseService.get(id, filter);
  sendResponse(httpStatus.OK, res, data, "Record fetched successfully");
});

export const getStockByWarehouse = asyncHandler(async (req, res, next) => {
  const { id } = req.params;
  const data = await WarehouseService.getStockWithWarehouseId(id);
  sendResponse(httpStatus.OK, res, data, "Record fetched successfully");
});

export const getStockWithPagination = asyncHandler(async (req,res,next) => {

})

export const create = asyncHandler(async (req, res, next) => {
  const data = req.body;
  const createdData = await WarehouseService.create(data);
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
  const updatedData = await WarehouseService.update(id, data);
  sendResponse(httpStatus.OK, res, updatedData, "Record updated successfully");
});

export const deleteData = asyncHandler(async (req, res, next) => {
  const { id } = req.params;
  await WarehouseService.deleteDoc(id);
  sendResponse(httpStatus.NO_CONTENT, res, null, "Record deleted successfully");
});
