import mongoose from "mongoose";
import Service from "#services/base";
import Packing from "#models/packing";
import httpStatus from "#utils/httpStatus";
import QuotationService from "#services/quotation";
import WarehouseService from "#services/warehouse";
import UserService from "#services/user";
import ProductService from "#services/product";

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
          packed: 1,
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
          localField: "products.product",
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
              input: "$products",
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
          packed: { $ne: true },
          packingId: null,
        },
      },
      {
        $project: {
          name: "$quotationNo",
        },
      },
    ]);
    const packedByData = UserService.getUserByRole("Warehouse");

    const [warehouse, quotation, packedBy] = await Promise.all([
      warehouseData,
      quotationData,
      packedByData,
    ]);

    return {
      packedBy,
      quotation,
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

  static async getMaxQuantity(filters) {
    const { quotationId, packingId = null } = filters;
    const quotationData = QuotationService.getDocById(quotationId);
    const existingPackingsData = this.Model.aggregate([
      {
        $match: {
          ...(packingId ? { _id: new mongoose.Types.ObjectId(packingId) } : {}),
          quotationId: new mongoose.Types.ObjectId(quotationId),
        },
      },
    ]);
    const [quotation, existingPackings] = await Promise.all([
      quotationData,
      existingPackingsData,
    ]);
    const maxAllowedQuantity = {};
    const maxQuantity = {};
    const currentPacked = {};
    let { products } = quotation;

    for (const product of products) {
      const id = product.product;
      maxQuantity[id] = product.quantity;
    }

    for (const packing of existingPackings) {
      const { products } = packing;
      for (const product of products) {
        currentPacked[product.product] =
          (currentPacked[product.product] ?? 0) + product.quantity;
      }
    }

    for (const product in maxQuantity) {
      if (!currentPacked[product]) currentPacked[product] = 0;
      maxAllowedQuantity[product] =
        maxQuantity[product] - currentPacked[product];
    }

    return maxAllowedQuantity;
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

    const warehouseData = WarehouseService.getDocById(warehouseId);
    const existingPackingsData = PackingService.getWithAggregate([
      {
        $match: {
          quotationId: new mongoose.Types.ObjectId(quotationId),
        },
      },
    ]);

    const [warehouse, existingPackings] = await Promise.all([
      warehouseData,
      existingPackingsData,
    ]);

    const maxAllowedQuantity = {};
    const maxQuantity = {};
    const currentPacked = {};
    let { products } = quotation;

    for (const product of products) {
      const id = product.product;
      maxQuantity[id] = product.quantity;
    }

    for (const packing of existingPackings) {
      const { products } = packing;
      for (const product of products) {
        currentPacked[product.product] =
          (currentPacked[product.product] ?? 0) + product.quantity;
      }
    }

    for (const product in maxQuantity) {
      if (!currentPacked[product]) currentPacked[product] = 0;
      maxAllowedQuantity[product] =
        maxQuantity[product] - currentPacked[product];
    }

    const { stock } = warehouse;

    packingData.customer = quotation.customer;

    for (const i in newProductData) {
      if (newProductData[i] > maxAllowedQuantity[i]) {
        const product = await ProductService.getDocById(i);
        throw {
          status: false,
          message: `You cannot pack more than allowed quantity for the product with the code ${product.productCode}`,
          httpStatus: httpStatus.BAD_REQUEST,
        };
      }

      const availableStock = stock.get(i) ?? 0;
      if (newProductData[i] > availableStock) {
        const product = await ProductService.getDocById(i);
        throw {
          status: false,
          message: `Insufficient stock for product with the code ${product.productCode}`,
          httpStatus: httpStatus.BAD_REQUEST,
        };
      }
      stock.set(i, availableStock - newProductData[i]);
    }

    const updatedProductArr = JSON.parse(JSON.stringify(products));

    for (const key of updatedProductArr) {
      const id = key.product;
      key.quantity = newProductData[id];
      packingData.netPackedQuantity += newProductData[id];
    }

    packingData.products = updatedProductArr;

    const createdPacking = await this.Model.create(packingData);
    await warehouse.save();
    await quotation.save();
    return createdPacking;
  }

  static async update(id, updates) {
    const newProductData = updates.products;

    const packing = await this.Model.findDocById(id);

    if (packing.packed) {
      throw {
        status: false,
        message: "Updating a completed packing isn't allowed",
        httpStatus: httpStatus.BAD_REQUEST,
      };
    }

    if ("packed" in updates && updates.packed !== packing.packed) {
      throw {
        status: false,
        message: "Cannot change packing status from here",
        httpStatus: httpStatus.BAD_REQUEST,
      };
    }

    const { warehouseId, quotationId } = packing;
    const { warehouseId: newWarehouseId } = updates;

    if (newWarehouseId && newWarehouseId !== warehouseId.toString()) {
      throw {
        status: false,
        message: "Cannot change warehouse of the packing",
        httpStatus: httpStatus.BAD_REQUEST,
      };
    }

    const dbCalls = [
      WarehouseService.getDocById(warehouseId),
      QuotationService.getDocById(quotationId),
      this.Model.find({
        _id: { $ne: id },
        quotationId,
      }),
    ];

    const [warehouse, quotation, existingPackings] = await Promise.all(dbCalls);

    const maxAllowedQuantity = {};
    const maxQuantity = {};
    const currentPacked = {};
    let { products } = quotation;

    for (const product of products) {
      const id = product.product;
      maxQuantity[id] = product.quantity;
    }

    for (const packing of existingPackings) {
      const { products } = packing;
      for (const product of products) {
        currentPacked[product.product] =
          (currentPacked[product.product] ?? 0) + product.quantity;
      }
    }

    for (const product in maxQuantity) {
      if (!currentPacked[product]) currentPacked[product] = 0;
      maxAllowedQuantity[product] =
        maxQuantity[product] - currentPacked[product];
    }

    const { stock } = warehouse;

    for (let product of packing.products) {
      const id = product.product;
      stock.set(id, stock.get(id) + product.quantity);
    }
    for (const i in newProductData) {
      if (newProductData[i] > maxAllowedQuantity[i]) {
        const product = await ProductService.getDocById(i);
        throw {
          status: false,
          message: `You cannot pack more than allowed quantity for the product with the code ${product.productCode}`,
          httpStatus: httpStatus.BAD_REQUEST,
        };
      }

      let availableStock = stock.get(i) ?? 0;
      if (newProductData[i] > availableStock) {
        const product = await ProductService.getDocById(i);
        throw {
          status: false,
          message: `Insufficient stock for product with the code ${product.productCode}`,
          httpStatus: httpStatus.BAD_REQUEST,
        };
      }
      stock.set(i, availableStock - newProductData[i]);
    }

    const updatedProductArr = JSON.parse(JSON.stringify(products));

    for (const key of updatedProductArr) {
      const id = key.product;
      key.quantity = newProductData[id];
      updates.netPackedQuantity += newProductData[id];
    }

    updates.products = updatedProductArr;

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

    const quotation = await QuotationService.getDocById(packing.quotationId);
    const { products } = quotation;

    for (let i of products) {
      if (i.quantity !== i.packedQuantity) {
        throw {
          status: false,
          message: "Invalid stock values",
          httpStatus: httpStatus.BAD_REQUEST,
        };
      }
    }

    packing.packed = true;
    await quotation.save();
    await packing.save();
  }
}

export default PackingService;
