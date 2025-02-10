import Payment from "#models/payment";
import Service from "#services/base";
import LedgerService from "#services/ledger";
import UserService from "#services/user";
import httpStatus from "#utils/httpStatus";

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
    const { employee, ledgerId } = paymentData;

    if (!employee && !ledgerId) {
      throw {
        status: false,
        message:
          "Either employee or ledger is mandotory is required to create payment",
        httpStatus: httpStatus.BAD_REQUEST,
      };
    }

    if (employee && ledgerId) {
      throw {
        status: false,
        message: "Only one field among employee or ledger is allowed, not both",
        httpStatus: httpStatus.BAD_REQUEST,
      };
    }

    if (employee) {
      delete paymentData.ledgerId;
      if (paymentData.paymentType) {
        if (paymentData.paymentType !== "Employee Expense") {
          throw {
            status: false,
            message: "Please choose a vlid payment type",
            httpStatus: httpStatus.BAD_REQUEST,
          };
        }
      } else {
        paymentData.paymentType = "Employee Expense";
      }
    } else {
      delete paymentData.employee;
      if (paymentData.paymentType) {
        if (paymentData.paymentType !== "Ledger Payment") {
          throw {
            status: false,
            message: "Please choose a valid payment type",
            httpStatus: httpStatus.BAD_REQUEST,
          };
        }
      } else {
        paymentData.paymentType = "Ledger Payment";
      }
    }
  }
}

export default PaymentService;
