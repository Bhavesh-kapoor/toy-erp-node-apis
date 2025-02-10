import Receiving from "#models/payment";
import Service from "#services/base";
import LedgerService from "#services/ledger";
import UserService from "#services/user";
import httpStatus from "#utils/httpStatus";

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

  static async getBaseFields() {
    const ledgerData = LedgerService.getWithAggregate([
      {
        $project: {
          name: "$companyName",
        },
      },
    ]);

    const employeeData = UserService.getWithAggregate([
      {
        $project: {
          name: 1,
          email: 1,
        },
      },
    ]);

    const [ledgers, employees] = await Promise.all([ledgerData, employeeData]);

    return {
      ledgers,
      employees,
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
    return await this.Model.create(receivingData);
  }

  static async update(id, updates) {
    const receiving = await this.Model.findDocById(id);
    this.validate(updates);

    receiving.update(updates);
    await receiving.save();
    return receiving;
  }

  static validate(receivingData) {
    const { ledgerId, invoiceId, purchaseReturnId } = receivingData;

    if (!ledgerId) {
      throw {
        status: false,
        message: "Ledger id is required to create a receiving",
        httpStatus: httpStatus.BAD_REQUEST,
      };
    }

    if (!invoiceId && !purchaseReturnId) {
      throw {
        status: false,
        message: "Cannot create receiving without invoice or purchaseReturn id",
        httpStatus: httpStatus.BAD_REQUEST,
      };
    }

    if (invoiceId && purchaseReturnId) {
      throw {
        status: false,
        message: "Cannot create receiving for both invoice and purchaseReturn",
        httpStatus: httpStatus.BAD_REQUEST,
      };
    }

    if (invoiceId) {
    }
  }
}

export default ReceivingService;
