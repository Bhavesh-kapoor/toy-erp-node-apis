import Service from "#services/base";
import Quotation from "#models/quotation";
import httpStatus from "#utils/httpStatus";
import ActivityLogService from "#services/activitylog";

class QuotationService extends Service {
  static Model = Quotation;

  static async get(id, filter) {
    const initialStage = [
      {
        $lookup: {
          from: "users",
          localField: "preparedBy",
          foreignField: "_id",
          as: "salesPerson",
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
          salesPersonName: { $arrayElemAt: ["$salesPerson.name", 0] },
          salesPersonEmail: { $arrayElemAt: ["$salesPerson.email", 0] },
          customerName: { $arrayElemAt: ["$customerData.companyName", 0] },
          quotationNo: 1,
          netAmount: 1,
          status: 1,
          _id: 1,
        },
      },
    ];

    const leadData = this.Model.findAll(filter, initialStage, extraStage);
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
