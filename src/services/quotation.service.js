import Service from "#services/base";
import Quotation from "#models/quotation";
import httpStatus from "#utils/httpStatus";
import ActivityLogService from "#services/activitylog";
import mongoose from "mongoose";
import LeadService from "#services/lead";
import LedgerService from "#services/ledger";

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
          leadName: {
            $concat: [
              { $arrayElemAt: ["$leadData.firstName", 0] },
              " ",
              { $arrayElemAt: ["$leadData.lastName", 0] },
            ],
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

  static async getLimitedFields(fields = {}) {
    const data = await this.Model.aggregate([
      {
        $project: {
          quotationNo: 1,
        },
      },
    ]);
    return data;
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

    const set = new Set();
    quotationData.products.forEach((ele) => {
      set.add(ele.product);
    });

    if (set.size !== quotationData.products.length) {
      throw {
        status: false,
        message: "Duplicate entries for products are not allowed",
        httpStatus: httpStatus.BAD_REQUEST,
      };
    }

    if (lead) {
      const existingQuotation = await this.Model.findOne({ lead });
      if (existingQuotation) {
        throw {
          status: false,
          message: `Another quotation for this lead already exist with the id ${existingQuotation.id}`,
          httpStatus: httpStatus.CONFLICT,
        };
      }
    }
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
    const { status: existingStatus } = quotation;
    const { status } = quotationData;

    if (status === existingStatus) {
      return;
    }

    switch (existingStatus) {
      case "Cancelled":
        throw {
          status: false,
          message: "Unable to update a cancelled quotation",
          httpStatus: httpStatus.BAD_REQUEST,
        };
      case "Approved":
        if (quotation.packingId) {
          throw {
            status: false,
            message: "Please delete the existing packing for this quotation",
            httpStatus: httpStatus.BAD_REQUEST,
          };
        }

        return;
    }

    if (status === "Cancelled") {
      quotation.status = "Cancelled";
      await quotation.save();
      return true;
    }

    if (quotation.lead && !quotation.customer) {
      const lead = await LeadService.get(quotation.lead);
      const customer = await LedgerService.create({
        companyName: lead.companyName,
        contactPerson: lead.firstName,
        ledgerType: "Customer",
        address1: lead.address,
        mobileNo: lead.phone,
        email: lead.email,
      });

      const customerId = customer.id;
      quotation.customer = customerId;
    }
    quotation.status = "Approved";
    await quotation.save();
    return quotation;
  }
}

export default QuotationService;
