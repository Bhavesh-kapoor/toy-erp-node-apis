import Transaction from "#models/transaction";
import Service from "#services/base";

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
    ];
    const extraStage = [
      {
        $project: {
          transactionNo: 1,
          transactionDate: 1,
          ledgerName: { $arrayElemAt: ["$ledgerData.companyName", 0] },
        },
      },
    ];

    if (!id) {
      return await this.Model.findAll(filter, initialStage, extraStage);
    }
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
