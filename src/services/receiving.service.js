import mongoose from "mongoose";
import Service from "#services/base";
import Receiving from "#models/payment";
import UserService from "#services/user";
import httpStatus from "#utils/httpStatus";
import LedgerService from "#services/ledger";
import InvoiceService from "#services/invoice";

class ReceivingService extends Service {
  static Model = Receiving;

  static async get(id, filter) {
    const initialStage = [
      {
        $match: {
          paymentType: { $in: ["Invoice, Purchase Return"] },
        },
      },
      {
        $lookup: {
          from: "ledgers",
          localField: "ledgerId",
          foreignField: "_id",
          as: "ledgerData",
        },
      },
      {
        $lookup: {
          from: "users",
          localField: "employee",
          foreignField: "_id",
          as: "employeeData",
        },
      },
    ];
    const extraStage = [
      {
        $project: {
          receivingNo: 1,
          receivingDate: 1,
          ledgerName: { $arrayElemAt: ["$ledgerData.companyName", 0] },
          employeeName: { $arrayElemAt: ["$employeeData.name", 0] },
          netAmount: 1,
          receivingType: 1,
          receivingMethod: 1,
          receivingStatus: 1,
          receivingDirection: 1,
        },
      },
    ];

    if (!id) {
      return await this.Model.findAll(filter, initialStage, extraStage);
    }

    return await this.Model.findDocById(id);
  }

  static async getBaseFields(type) {
    if (type === "Invoice") {
      const ledger = await LedgerService.getWithAggregate([
        {
          $match: { ledgerType: { $in: ["Customer", "Both"] } },
        },
        {
          $project: {
            name: "$companyName",
          },
        },
      ]);
      const invoice = await InvoiceService.getWithAggregate([
        {
          $match: {
            amountPending: { $gt: 0 },
          },
        },
        {
          $project: {
            name: "$billNumber",
          },
        },
      ]);

      return {
        ledger,
        invoice,
      };
    } else {
      const ledger = await LedgerService.getWithAggregate([
        {
          $match: { $in: ["Both", "Supplier"] },
        },
        {
          $project: {
            name: "$companyName",
          },
        },
      ]);
    }

    return {
      ledger,
    };
  }

  static async getLimitedReceivingFields() {
    const receivingData = await this.getWithAggregate([
      {
        $project: {
          receivingNo: 1,
        },
      },
    ]);
    return receivingData;
  }

  static async create(receivingData) {
    this.validate(receivingData);
    const existingReceiving = await this.Model.findDoc(
      { invoiceId: receivingData.invoiceId, status: "Pending" },
      true,
    );

    if (existingReceiving) {
      throw {
        status: false,
        message: "Please approve the existing receiving first",
        httpStatus: httpStatus.BAD_REQUEST,
      };
    }
    const quotation = await QuotationService.getDoc({
      invoiceId: paymentData.invoiceId,
    });
    quotation.amountPaid += receivingData.amount;
    quotation.amountPending = quotation.netAmount - quotation.amountPaid;
    const receiving = await this.Model.create(receivingData);
    await quotation.save();
    return receiving;
  }

  static async update(id, updates) {
    const receiving = await this.Model.findDocById(id);
    this.validate(updates);

    receiving.update(updates);
    awaitreceiving.save();
    return receiving;
  }

  static validate(receivingData) {
    const {
      ledgerId,
      invoiceId,
      purchaseReturnId,
      paymentType,
      purchaseId,
      invoiceReturnId,
    } = receivingData;

    if (!paymentType) {
      throw {
        status: false,
        message: "Payment type is required",
        httpStatus: httpStatus.BAD_REQUEST,
      };
    }

    if (paymentType === "Invoice") {
      if (!invoiceId) {
        throw {
          status: false,
          message: "Invoice Id is required",
          httpStatus: httpStatus.BAD_REQUEST,
        };
      }
      if (purchaseReturnId || purchaseId || invoiceReturnId) {
        throw {
          status: false,
          message: "Invalid receiving",
          httpStatus: httpStatus.BAD_REQUEST,
        };
      }
    } else if (paymentType === "Purchase Return") {
      if (!purchaseReturnId) {
        throw {
          status: false,
          message: "PurchaseReturn Id is required",
          httpStatus: httpStatus.BAD_REQUEST,
        };
      }
      if (purchaseId || invoiceReturnId || invoiceId) {
        throw {
          status: false,
          message: "Invalid receiving",
          httpStatus: httpStatus.BAD_REQUEST,
        };
      }
    } else {
      throw {
        status: false,
        message: "Invalid receiving",
        httpStatus: httpStatus.BAD_REQUEST,
      };
    }

    if (!ledgerId) {
      throw {
        status: false,
        message: "Ledger id is required to create a receiving",
        httpStatus: httpStatus.BAD_REQUEST,
      };
    }
  }
}

export default ReceivingService;
