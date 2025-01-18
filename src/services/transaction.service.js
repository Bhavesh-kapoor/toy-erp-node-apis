import Transaction from "#models/transaction";
import Service from "#services/base";
import LedgerService from "#services/ledger";
import UserService from "#services/user";
import httpStatus from "#utils/httpStatus";

class TransactionService extends Service {
  static Model = Transaction;

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
          transactionNo: 1,
          transactionDate: 1,
          ledgerName: { $arrayElemAt: ["$ledgerData.companyName", 0] },
          employeeName: { $arrayElemAt: ["$employeeData.name", 0] },
          netAmount: 1,
          paymentType: 1,
          paymentStatus: 1,
          paymentDirection: 1,
        },
      },
    ];

    if (!id) {
      return await this.Model.findAll(filter, initialStage, extraStage);
    }
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

  static async getLimitedTransactionFields() {
    const transactionData = await this.getWithAggregate([
      {
        $project: {
          transactionNo: 1,
        },
      },
    ]);
    return transactionData;
  }

  static async create(transactionData) {
    this.validate(transactionData);
    return await this.Model.create(transactionData);
  }

  static async update(id, updates) {
    const transaction = await this.Model.findDocById(id);
    this.validate(updates);

    transaction.update(updates);
    await transaction.save();
    return transaction;
  }

  static validate(transactionData) {
    const { employee, ledgerId } = transactionData;

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
      delete transactionData.ledgerId;
      if (transactionData.paymentType) {
        if (transactionData.paymentType !== "Employee Expense") {
          throw {
            status: false,
            message: "Please choose a valid payment type",
            httpStatus: httpStatus.BAD_REQUEST,
          };
        }
      } else {
        transactionData.paymentType = "Employee Expense";
      }
    } else {
      delete transactionData.employee;
      if (transactionData.paymentType) {
        if (transactionData.paymentType !== "Ledger Payment") {
          throw {
            status: false,
            message: "Please choose a valid payment type",
            httpStatus: httpStatus.BAD_REQUEST,
          };
        }
      } else {
        transactionData.paymentType = "Ledger Payment";
      }
    }
  }
}

export default TransactionService;
