import Transaction from "#models/transaction";
import Service from "#services/base";
import LedgerService from "#services/ledger";
import UserService from "#services/user";

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
}

export default TransactionService;
