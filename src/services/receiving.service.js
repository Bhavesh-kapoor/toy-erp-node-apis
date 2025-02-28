import mongoose from "mongoose";
import Service from "#services/base";
import Receiving from "#models/receiving";
import UserService from "#services/user";
import httpStatus from "#utils/httpStatus";
import LedgerService from "#services/ledger";
import InvoiceService from "#services/invoice";

class ReceivingService extends Service {
  static Model = Receiving;

  static async get(id, filter) {
    const initialStage = [
      {
        $lookup: {
          from: "ledgers",
          localField: "ledgerId",
          foreignField: "_id",
          as: "ledgerData",
        },
      },
    ];
    const extraStage = [
      {
        $project: {
          receivingNo: 1,
          receivingDate: 1,
          ledgerName: { $arrayElemAt: ["$ledgerData.companyName", 0] },
          netAmount: 1,
          receivingType: 1,
          receivingMethod: 1,
          receivingStatus: 1,
        },
      },
    ];

    if (!id) {
      return await this.Model.findAll(filter, initialStage, extraStage);
    }

    return await this.Model.findDocById(id);
  }

  static async getBaseFields(type) {
    //if (type === "Invoice") {
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
          paid: { $ne: true },
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
    //} else {
    //  const ledger = await LedgerService.getWithAggregate([
    //    {
    //      $match: { ledgerType: { $in: ["Both", "Supplier"] } },
    //    },
    //    {
    //      $project: {
    //        name: "$companyName",
    //      },
    //    },
    //  ]);
    //}

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
    const receiving = await this.Model.create(receivingData);
    return receiving;
  }

  static async update(id, updates) {
    const receiving = await this.Model.findDocById(id);
    this.validate(updates);

    receiving.update(updates);
    await receiving.save();
    return receiving;
  }

  static validate(receivingData) {
    const {
      ledgerId,
      invoiceId,
      purchaseReturnId,
      receivingType,
      purchaseId,
      invoiceReturnId,
    } = receivingData;

    if (!receivingType) {
      throw {
        status: false,
        message: "Receiving type is required",
        httpStatus: httpStatus.BAD_REQUEST,
      };
    }

    if (receivingType === "Invoice") {
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
    } else if (receivingType === "Purchase Return") {
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
