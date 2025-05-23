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
          packedBy: { $arrayElemAt: ["$packedByData.name", 0] },
          packingDate: 1,
          enquiryDate: 1,
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
          ...(packingId
            ? { _id: { $ne: new mongoose.Types.ObjectId(packingId) } }
            : {}),
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
    let totalProducts = 0;

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

      totalProducts += maxAllowedQuantity[product];
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

    let totalPacked = 0;
    for (const key of updatedProductArr) {
      const id = key.product;
      key.quantity = newProductData[id];
      totalPacked += key.quantity;
      packingData.netPackedQuantity += newProductData[id];
    }

    if (totalPacked < 1) {
      throw {
        status: false,
        message: "Please add atleast one product",
        httpStatus: httpStatus.BAD_REQUEST,
      };
    }

    if (totalPacked > totalProducts) {
      throw {
        status: false,
        message: "Invalid quantity",
        httpStatus: httpStatus.BAD_REQUEST,
      };
    }

    if (totalProducts === totalPacked) {
      quotation.packed = true;
    } else {
      quotation.packed = false;
    }

    packingData.netPackedQuantity = totalPacked;

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

    let totalProducts = 0;

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

      totalProducts += maxAllowedQuantity[product];
    }

    const { stock } = warehouse;

    for (let product of packing.products) {
      const id = product.product;
      if (!(id in maxQuantity)) {
        throw {
          status: false,
          message: "Invalid update operation",
          httpStatus: httpStatus.BAD_REQUEST,
        };
      }

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

    let totalPacked = 0;
    for (const key of updatedProductArr) {
      const id = key.product;
      if (!(id in maxQuantity)) {
        throw {
          status: false,
          message: "Invalid update operation",
          httpStatus: httpStatus.BAD_REQUEST,
        };
      }
      key.quantity = newProductData[id];
      totalPacked += key.quantity;
      updates.netPackedQuantity += newProductData[id];
    }

    if (totalPacked < 1) {
      throw {
        status: false,
        message: "Please add atleast one product",
        httpStatus: httpStatus.BAD_REQUEST,
      };
    }

    if (totalPacked > totalProducts) {
      throw {
        status: false,
        message: "Invalid quantity",
        httpStatus: httpStatus.BAD_REQUEST,
      };
    }

    if (totalProducts === totalPacked) {
      quotation.packed = true;
    } else {
      quotation.packed = false;
    }

    updates.products = updatedProductArr;

    delete updates.customer;
    delete updates.quotationId;
    delete updates.packingNo;

    packing.update(updates);
    packing.netPackedQuantity = totalPacked;

    await packing.save();
    await warehouse.save();
    await quotation.save();
    return packing;
  }

  static async updatePackedStatus(id, packingData) {
    const packing = await this.Model.findDocById(id);

    const { packed: newStatus } = packingData;

    const { packed } = packing;

    if (packed === newStatus) {
      return null;
    }

    if (packing.invoiceId) {
      throw {
        status: false,
        message: "Cannot update a packing with invoiceId",
        httpStatus: httpStatus.BAD_REQUEST,
      };
    }

    if (packed === true) {
      throw {
        status: false,
        message: "Unable to update packed packaging, please delete this one",
        httpStatus: httpStatus.BAD_REQUEST,
      };
    }

    const { products: packedProducts } = packing;

    //for (let i of products) {
    //  if (i.quantity < i.packedQuantity) {
    //    throw {
    //      status: false,
    //      message: "Invalid stock values",
    //      httpStatus: httpStatus.BAD_REQUEST,
    //    };
    //  }
    //
    //

    const finalProducts = packedProducts.filter((ele) => {
      return ele.quantity;
    });

    packing.products = finalProducts;

    packing.packed = true;
    await packing.save();
  }

  static async deleteDoc(id) {
    const packing = await this.Model.findDocById(id);
    const quotationData = QuotationService.getDocById(packing.quotationId);
    const warehouseData = await WarehouseService.getDocById(
      packing.warehouseId,
    );

    const [quotation, warehouse] = await Promise.all([
      quotationData,
      warehouseData,
    ]);

    const { stock } = warehouse;
    const { products } = packing;

    if (packing.invoiceId) {
      throw {
        status: false,
        message: "Cannot delete packing with active billing",
        httpStatus: httpStatus.BAD_REQUEST,
      };
    }

    let totalPacked = 0;
    for (const key of products) {
      const id = key.product.toString();
      totalPacked += key.quantity;
      stock.set(id, stock.get(id) + key.quantity);
    }
    if (totalPacked) quotation.packed = false;

    await quotation.save();
    await warehouse.save();
    await packing.deleteOne();
  }
}

export default PackingService;
