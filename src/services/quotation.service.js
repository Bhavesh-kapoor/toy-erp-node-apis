import Service from "#services/base";
import Quotation from "#models/quotation";
import httpStatus from "#utils/httpStatus";
import ActivityLogService from "#services/activitylog";
import mongoose from "mongoose";

class QuotationService extends Service {
  static Model = Quotation;

  static async get(id, filter) {
    const initialStage = [
      {
        $lookup: {
          from: "users",
          localField: "preparedBy",
          foreignField: "_id",
          as: "preparedByData",
        },
      },
      {
        $lookup: {
          from: "ledgers",
          localField: "customer",
          foreignField: "_id",
          as: "customerData",
        },
      },

      {
        $lookup: {
          from: "leads",
          localField: "lead",
          foreignField: "_id",
          as: "leadData",
        },
      },
    ];

    const extraStage = [
      {
        $project: {
          preparedByName: { $arrayElemAt: ["$preparedByData.name", 0] },
          preparedByEmail: { $arrayElemAt: ["$preparedByData.email", 0] },
          customerName: { $arrayElemAt: ["$customerData.companyName", 0] },
          leadName: {
            $concat: [
              { $arrayElemAt: ["$leadData.firstName", 0] },
              " ",
              { $arrayElemAt: ["$leadData.lastName", 0] },
            ],
          },
          quotationNo: 1,
          netAmount: 1,
          status: 1,
          _id: 1,
        },
      },
    ];

    if (!id) {
      const leadData = this.Model.findAll(filter, initialStage, extraStage);
      return leadData;
    }

    const leadData = await this.Model.aggregate([
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
            { $unwind: "$uom" },
            {
              $project: {
                _id: 0,
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
          products: {
            $map: {
              input: "$products",
              as: "product",
              in: {
                $mergeObjects: [
                  "$$product",
                  {
                    $arrayElemAt: [
                      "$productDetails",
                      {
                        $indexOfArray: [
                          "$productDetails._id",
                          "$$product.product",
                        ],
                      },
                    ],
                  },
                ],
              },
            },
          },
          preparedByName: { $arrayElemAt: ["$preparedByData.name", 0] },
          preparedByEmail: { $arrayElemAt: ["$preparedByData.email", 0] },
          customerName: { $arrayElemAt: ["$customerData.companyName", 0] },
        },
      },
      {
        $project: {
          productDetails: 0,
          preparedByData: 0,
          customerData: 0,
          leadData: 0,
        },
      },
    ]);
    return leadData;
  }

  static async create(quotationData) {
    const { customer, lead } = quotationData;
    if (!customer && !lead) {
      throw {
        status: false,
        message: "No lead or customer is associated with this quotation",
        httpStatus: httpStatus.BAD_REQUEST,
      };
    }
    if (customer) delete quotationData.lead;
    const quotation = await this.Model.create(quotationData);
    await ActivityLogService.create({
      quotation: quotation.id,
      action: "QUOTATION_CREATED",
      description: `A new quotation with id ${quotation.id} is created`,
    });
    return quotation;
  }

  static async changeQuotationStatus(id, quotationData) {
    const quotation = await this.Model.findDocById(id);
    const { status } = quotationData;
    if (status !== "Approved") {
      quotation.status = status;
      await quotation.save();
      return quotation;
    }

    if (quotation.customer) {
    }
  }
}

export default QuotationService;
