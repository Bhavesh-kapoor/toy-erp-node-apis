import mongoose from "mongoose";
import Service from "#services/base";
import Packing from "#models/packing";
import httpStatus from "#utils/httpStatus";
import QuotationService from "#services/quotation";
import WarehouseService from "#services/warehouse";
import UserService from "#services/user";

class PackingService extends Service {
  static Model = Packing;

  static async get(id, filter) {
    const initialStage = [
      {
        $lookup: {
          localField: "customer",
          foreignField: "_id",
          from: "ledgers",
          as: "customerData",
        },
      },
      {
        $lookup: {
          localField: "packedBy",
          foreignField: "_id",
          from: "users",
          as: "packedByData",
        },
      },
      {
        $lookup: {
          localField: "quotationId",
          foreignField: "_id",
          from: "quotations",
          as: "quotationData",
        },
      },
      {
        $unwind: {
          path: "$quotationData",
          preserveNullAndEmptyArrays: true,
        },
      },
    ];

    const extraStage = [
      {
        $project: {
          packingNo: 1,
          quotationNo: "$quotationData.quotationNo",
          customer: { $arrayElemAt: ["$customerData.companyName", 0] },
          netAmount: "$quotationData.netAmount",
          packedBy: { $arrayElemAt: ["$packedByData.name", 0] },
          packingDate: 1,
          enquiryDate: 1,
          nagPacking: 1,
          totalQuantity: 1,
          netPackedQuantity: 1,
          invoiceId: 1,
          quotation: "$quotationData._id",
        },
      },
    ];

    if (!id) {
      return this.Model.findAll(filter, initialStage, extraStage);
    }

    const data = await this.Model.aggregate([
      { $match: { _id: new mongoose.Types.ObjectId(id) } },
      ...initialStage,
      {
        $lookup: {
          from: "products",
          localField: "quotationData.latestData.product",
          foreignField: "_id",
          pipeline: [
            {
              $lookup: {
                from: "productuoms",
                localField: "uom",
                foreignField: "_id",
                as: "uom",
              },
            },
            { $unwind: { path: "$uom", preserveNullAndEmptyArrays: true } },
            {
              $project: {
                _id: 1,
                name: 1,
                description: 1,
                productCode: 1,
                uom: "$uom.shortName",
              },
            },
          ],
          as: "productDetails",
        },
      },
      {
        $lookup: {
          from: "warehouses",
          localField: "warehouseId",
          foreignField: "_id",
          as: "warehouseData",
        },
      },
      {
        $addFields: {
          quotationNo: "$quotationData.quotationNo",
          quotationId: "$quotationData._id",
          customerName: { $arrayElemAt: ["$customerData.companyName", 0] },
          packedByName: { $arrayElemAt: ["$packedByData.name", 0] },
          warehouseName: { $arrayElemAt: ["$warehouseData.name", 0] },
          customerName: { $arrayElemAt: ["$customerData.companyName", 0] },
          products: {
            $map: {
              input: "$quotationData.latestData",
              as: "product",
              in: {
                $mergeObjects: [
                  "$$product",
                  {
                    $arrayElemAt: [
                      {
                        $filter: {
                          input: "$productDetails",
                          as: "detail",
                          cond: { $eq: ["$$detail._id", "$$product.product"] },
                        },
                      },
                      0,
                    ],
                  },
                ],
              },
            },
          },
        },
      },
      {
        $project: {
          customerData: 0,
          quotationData: 0,
          productDetails: 0,
          packedByData: 0,
          warehouseData: 0,
        },
      },
    ]);

    return data[0];
  }

  static async getBaseFields() {
    const warehouseData = WarehouseService.getLimitedFields();
    const quotationData = QuotationService.getWithAggregate([
      {
        $match: {
          status: "Approved",
          delivered: { $ne: true },
        },
      },
      {
        $project: {
          name: "$quotationNo",
        },
      },
    ]);
    const packingData = this.Model.aggregate([
      {
        $match: {
          invoiceId: null,
        },
      },
      {
        $lookup: {
          from: "quotations",
          localField: "quotationId",
          foreignField: "_id",
          as: "quotationData",
        },
      },
      {
        $project: {
          name: { $arrayElemAt: ["$quotationData.quotationNo", 0] },
        },
      },
    ]);
    const packedByData = UserService.getUserByRole("Warehouse");

    const [warehouse, quotation, packedBy, packing] = await Promise.all([
      warehouseData,
      quotationData,
      packedByData,
      packingData,
    ]);

    const excludedQuotations = {};
    for (let key of packing) {
      excludedQuotations[key["name"]] = true;
    }

    const modifiedQuotations = quotation.filter((ele) => {
      if (!excludedQuotations[ele["name"]]) return true;
    });

    return {
      packedBy,
      quotation: modifiedQuotations,
      warehouse,
    };
  }

  static async getLimitedFields(filter) {
    const pipeline = [
      {
        $match: filter,
      },
      {
        $project: {
          packingNo: 1,
        },
      },
    ];

    const data = await this.Model.aggregate(pipeline);
    return data;
  }

  static async create(packingData) {
    const { quotationId, warehouseId, products: newProductData } = packingData;
    const quotation = await QuotationService.getDocById(quotationId);
    if (quotation.status !== "Approved") {
      throw {
        status: false,
        message: `Can't create packing for ${quotation.status} quotation`,
        httpStatus: httpStatus.BAD_REQUEST,
      };
    }

    if (quotation.delivered) {
      throw {
        status: false,
        message: "Cannot create packing for completed sale",
        httpStatus: httpStatus.CONFLICT,
      };
    }

    if (!quotation.latestData.length) {
      throw {
        status: false,
        message: "All the products of this quotation has been packed",
        httpStatus: httpStatus.BAD_REQUEST,
      };
    }

    const warehouse = await WarehouseService.getDocById(warehouseId);

    let { latestData } = quotation;
    const { stock } = warehouse;

    latestData.forEach((ele) => {
      const id = ele.product;
      const availableStock = stock.get(id);

      if (!availableStock || availableStock < ele.quantity) {
        throw {
          status: false,
          message: `Stock not available for product with id ${id}`,
          httpStatus: httpStatus.BAD_REQUEST,
        };
      }
      ele.packedQuantity = newProductData[id];
      stock.set(id, stock.get(id) - ele.quantity);
    });
    packingData.customer = quotation.customer;

    const createdPacking = await this.Model.create(packingData);
    quotation.packingId = createdPacking.id;
    await warehouse.save();
    await quotation.save();
    return createdPacking;
  }

  static async update(id, updates) {
    const existingProducts = updates.products;

    const packing = await this.Model.findDocById(id);

    if (packing.invoiceId) {
      throw {
        status: false,
        message: "Cannot update a packing which has an active invoice",
        httpStatus: httpStatus.BAD_REQUEST,
      };
    }

    if (packing.packed) {
      throw {
        status: false,
        message: "Updating a completed packing isn't allowed",
        httpStatus: httpStatus.BAD_REQUEST,
      };
    }

    if (updates.packed && updates.packed !== packing.packed) {
      throw {
        status: false,
        message: "Cannot change packing status from here",
        httpStatus: httpStatus.BAD_REQUEST,
      };
    }

    const { warehouseId } = updates;
    if (warehouseId && warehouseId !== packing.warehouseId.toString()) {
      throw {
        status: false,
        message: "Cannot change warehouse of the packing",
        httpStatus: httpStatus.BAD_REQUEST,
      };
    }

    const dbCalls = [
      WarehouseService.getDocById(packing.warehouseId),
      QuotationService.getDocById(packing.quotationId),
    ];

    const [warehouse, quotation] = await Promise.all(dbCalls);
    const { latestData: products } = quotation;

    if (Object.keys(existingProducts).length !== products.length) {
      throw {
        status: false,
        message: "Invalid update operation",
        httpStatus: httpStatus.BAD_REQUEST,
      };
    }

    const { stock } = warehouse;

    for (let ele of products) {
      stock.set(
        ele.product,
        (stock.get(ele.product) ?? 0) + ele.packedQuantity,
      );
    }

    for (let ele in existingProducts) {
      const availableStock = stock.get(ele) ?? 0;
      if (availableStock < existingProducts[ele]) {
        throw {
          status: false,
          message: `Stock not available for the product with id ${ele.product}`,
          httpStatus: httpStatus.BAD_REQUEST,
        };
      }
      stock.set(ele, availableStock - existingProducts[ele]);
    }

    for (let ele of products) {
      ele.packedQuantity = existingProducts[ele.product];
    }

    delete updates.customer;
    delete updates.quotationId;
    delete updates.packingNo;

    delete updates.products;

    packing.update(updates);
    await packing.save();
    await warehouse.save();
    await quotation.save();

    return packing;
  }

  static async updatePackedStatus(id, packingData) {
    const packing = await this.Model.findDocById(id);

    const { packed } = packing;
    const { packed: newStatus } = packingData;

    if (packed === newStatus) {
      return;
    }

    if (packed === true) {
      throw {
        status: false,
        message: "cannot update a packed package",
        httpStatus: httpStatus.BAD_REQUEST,
      };
    }

    if (packing.invoiceId) {
      throw {
        status: false,
        message: "cannot update a packing which has an active invoice",
        httpStatus: httpStatus.BAD_REQUEST,
      };
    }

    const quotation = await QuotationService.getDocById(packing.quotationId);
    const { latestData } = quotation;

    const modifiedProducts = latestData.filter((ele) => {
      if (ele.packedQuantity > ele.quantity) {
        throw {
          status: false,
          message: "Invalid packing data format",
          httpStatus: httpStatus.BAD_REQUEST,
        };
      }

      if (ele.packedQuantity === ele.quantity) return false;
      return true;
    });

    quotation.latestData = modifiedProducts;
    packing.packed = true;
    await quotation.save();
    await packing.save();
  }
}

export default PackingService;
