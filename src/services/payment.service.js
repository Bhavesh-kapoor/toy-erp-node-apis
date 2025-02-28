import Service from "#services/base";
import Payment from "#models/payment";
import UserService from "#services/user";
import httpStatus from "#utils/httpStatus";
import LedgerService from "#services/ledger";
import PurchaseService from "#services/purchase";
import QuotationService from "#services/quotation";

class PaymentService extends Service {
  static Model = Payment;

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
          paymentNo: 1,
          paymentDate: 1,
          ledgerName: { $arrayElemAt: ["$ledgerData.companyName", 0] },
          employeeName: { $arrayElemAt: ["$employeeData.name", 0] },
          netAmount: 1,
          paymentType: 1,
          paymentMethod: 1,
          paymentStatus: 1,
          paymentDirection: 1,
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

    const purchaseData = PurchaseService.getWithAggregate([
      {
        $match: {
          stockAdded: true,
        },
      },
      {
        $project: {
          name: "$purchaseNo",
        },
      },
    ]);

    const [ledgers, purchases] = await Promise.all([ledgerData, purchaseData]);

    return {
      ledgers,
      purchases,
    };
  }

  static async getLimitedPaymentFields() {
    const paymentData = await this.getWithAggregate([
      {
        $project: {
          paymentNo: 1,
        },
      },
    ]);
    return paymentData;
  }

  static async create(paymentData) {
    this.validate(paymentData);
    return await this.Model.create(paymentData);
  }

  static async update(id, updates) {
    const payment = await this.Model.findDocById(id);
    this.validate(updates);

    payment.update(updates);
    await payment.save();
    return payment;
  }

  static validate(paymentData) {
    const { ledgerId, invoiceReturnId, purchaseId } = paymentData;

    if (!ledgerId) {
      throw {
        status: false,
        message: "Ledger id is required to create a payment",
        httpStatus: httpStatus.BAD_REQUEST,
      };
    }

    if (!invoiceReturnId && !purchaseId) {
      throw {
        status: false,
        message: "Cannot create payment without invoice or purchaseReturn id",
        httpStatus: httpStatus.BAD_REQUEST,
      };
    }

    if (invoiceReturnId && purchaseId) {
      throw {
        status: false,
        message: "Cannot create payment for both invoice and purchaseReturn",
        httpStatus: httpStatus.BAD_REQUEST,
      };
    }
  }
}

export default PaymentService;
