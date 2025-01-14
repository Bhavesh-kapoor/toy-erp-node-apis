import _ from "lodash";
import Ledger from "#models/ledger";
import Service from "#services/base";

class LedgerService extends Service {
  static Model = Ledger;

  static async get(id, filter) {
    const initialStage = [
      {
        $lookup: {
          localField: "groupBy",
          foreignField: "_id",
          from: "users",
          as: "groupedUnder",
        },
      },
    ];

    const extraStage = [
      {
        $project: {
          companyName: 1,
          contactPerson: 1,
          ledgerType: 1,
          groupUnderName: { $arrayElemAt: ["$groupedUnder.name", 0] },
          groupedUnderEmail: { $arrayElemAt: ["$groupedUnder.email", 0] },
          mobileNo: 1,
          email: 1,
          createdAt: 1,
          state: "$address.state",
          country: "$address.country",
        },
      },
    ];

    if (!id) {
      return await this.Model.findAll(filter, initialStage, extraStage);
    }
  }
}

export default LedgerService;
