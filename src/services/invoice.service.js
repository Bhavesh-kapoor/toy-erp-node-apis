import mongoose from "mongoose";
import Service from "#services/base";
import Invoice from "#models/invoice";
import UserService from "#services/user";
import httpStatus from "#utils/httpStatus";
import LedgerService from "#services/ledger";
import QuotationService from "#services/quotation";

class InvoiceService extends Service {
  static Model = Invoice;

  static async get(id, filter) {
    const initialStage = [
      {
        $lookup: {
          from: "ledgers",
          localField: "invoiceTo",
          foreignField: "_id",
          as: "invoiceToDetails",
        },
      },
      {
        $lookup: {
          from: "ledgers",
          localField: "shipTo",
          foreignField: "_id",
          as: "shipToDetails",
        },
      },
      {
        $lookup: {
          from: "users",
          localField: "preparedBy",
          foreignField: "_id",
          as: "preparedByDetails",
        },
      },
      {
        $lookup: {
          from: "quotations",
          localField: "quotationId",
          foreignField: "_id",
          as: "quotationDetails",
        },
      },
    ];

    const extraStage = [
      {
        $project: {
          _id: 1,
          billNumber: 1,
          billDate: 1,
          invoiceTo: 1,
          referenceNo: 1,
          shipTo: 1,
          invoiceTo: { $arrayElemAt: ["$invoiceToDetails.companyName", 0] },
          shipTo: { $arrayElemAt: ["$shipToDetails.companyName", 0] },
          preparedBy: { $arrayElemAt: ["$preparedByDetails.name", 0] },
          quotationNo: { $arrayElemAt: ["$quotationDetails.quotationNo", 0] },
          netAmount: { $arrayElemAt: ["$quotationDetails.netAmount", 0] },
        },
      },
    ];

    if (!id) {
      const invoiceData = this.Model.findAll(filter, initialStage, extraStage);
      return invoiceData;
    }

    const invoiceData = await this.Model.aggregate([
      { $match: { _id: new mongoose.Types.ObjectId(id) } },
      ...initialStage,
      {
        $project: {
          _id: 1,
          billNumber: 1,
          billDate: 1,
          invoiceTo: 1,
          referenceNo: 1,
          shipTo: 1,
          preparedBy: 1,
          quotationNo: { $arrayElemAt: ["$quotationDetails.quotationNo", 0] },
          quotationId: 1,
          netAmount: { $arrayElemAt: ["$quotationDetails.netAmount", 0] },
          remarks: 1,
          vehicleDetails: 1,
          driverName: 1,
          driverPhone: 1,
          dispatchMode: 1,
          placeOfSupply: 1,
          transportThrough: 1,
          grOrLrNumber: 1,
        },
      },
    ]);

    if (!invoiceData.length) {
      throw {
        status: false,
        message: "Invoice not found",
        httpStatus: httpStatus.NOT_FOUND,
      };
    }

    const invoice = invoiceData[0];
    const quotation = await QuotationService.get(invoice.quotationId);

    invoice.quotation = quotation;

    return invoice;
  }

  static async getBaseFields() {
    const userData = UserService.getUserByRole("Accountant");
    const ledgerData = LedgerService.getWithAggregate([
      {
        $match: {
          ledgerType: {
            $in: ["Customer", "Both"],
          },
        },
      },
      {
        $project: {
          name: "$companyName",
        },
      },
    ]);
    const quotationData = QuotationService.getWithAggregate([
      {
        $match: {
          status: "Approved",
          invoiceId: null,
        },
      },
      {
        $project: {
          name: "$quotationNo",
        },
      },
    ]);

    const [users, quotations, ledgers] = await Promise.all([
      userData,
      quotationData,
      ledgerData,
    ]);
    return {
      users,
      quotations,
      ledgers,
    };
  }

  static async create(invoiceData) {
    const { quotationId } = invoiceData;
    const quotation = await QuotationService.getDocById(quotationId);
    if (quotation.invoiceId) {
      throw {
        status: false,
        message: "Another bill for this quotation already exists",
        httpStatus: httpStatus.CONFLICT,
      };
    }

    if (quotation.status !== "Approved") {
      throw {
        status: false,
        message: `Cannot create invoice for ${quotation.status} quotation`,
        httpStatus: httpStatus.BAD_REQUEST,
      };
    }

    const invoice = await this.Model.create(invoiceData);
    quotation.invoiceId = invoice._id;
    await quotation.save();
    return invoice;
  }
}

export default InvoiceService;
