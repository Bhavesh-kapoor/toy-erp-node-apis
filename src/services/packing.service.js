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
          quotation: "$quotationData._id",
        },
      },
    ];

    if (!id) {
      return this.Model.findAll(filter, initialStage, extraStage);
    }

    return this.Model.aggregate([
      { $match: { _id: new mongoose.Types.ObjectId(id) } },
      ...initialStage,
      {
        $lookup: {
          from: "products",
          localField: "quotationData.products.product",
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
        $addFields: {
          quotationNo: "$quotationData.quotationNo",
          quotationId: "$quotationData._id",
          products: {
            $map: {
              input: "$quotationData.products",
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
          quotationDetails: 0,
        },
      },
    ]);
  }

  static async getBaseFields() {
    const warehouseData = WarehouseService.getLimitedFields();
    const quotationData = QuotationService.getLimitedFields({
      status: "Approved",
    });
    const packedByData = UserService.getLimitedFields();

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

  static async create(packingData) {
    const { quotationId, warehouseId, products: newProductData } = packingData;
    const quotation = await QuotationService.get(quotationId);
    if (quotation.status !== "Approved") {
      throw {
        status: false,
        message: `Can't create packing for ${quotation.status} quotation`,
        httpStatus: httpStatus.BAD_REQUEST,
      };
    }

    if (quotation.packingId) {
      throw {
        status: false,
        message: "Another packing for this quotation is already present",
        httpStatus: httpStatus.CONFLICT,
      };
    }

    const existingPacking = await this.Model.findOne({ quotationId });
    if (existingPacking) {
      throw {
        status: false,
        message: "Another packing for this quotation already exist",
        httpStatus: httpStatus.BAD_REQUEST,
      };
    }

    const warehouse = await WarehouseService.get(warehouseId);

    const { products } = quotation;
    const { stock } = warehouse;

    products.forEach((ele, index) => {
      const id = ele.product;
      const availableStock = stock[id];

      if (!availableStock || availableStock < ele.quantity) {
        throw {
          status: false,
          message: `Stock not available for product with id ${id}`,
          httpStatus: httpStatus.BAD_REQUEST,
        };
      }
      ele.packedQuantity = newProductData[id];
      stock[id] -= ele.quantity;
    });
    packingData.customer = quotation.customer;

    const createdPacking = await this.Model.create(packingData);
    quotation.packingId = createdPacking.id;
    await warehouse.save();
    await quotation.save();
    return createdPacking;
  }
}

export default PackingService;
