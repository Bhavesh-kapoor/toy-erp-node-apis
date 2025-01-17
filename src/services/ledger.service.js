import mongoose from "mongoose";
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

    //NOTE: Lookup is not required in getById
    initialStage.pop();

    const ledgerData = await this.Model.aggregate([
      {
        $match: {
          _id: new mongoose.Types.ObjectId(id),
        },
      },
      ...initialStage,
      {
        $set: {
          line1: "$address.line1",
          street: "$address.street",
          city: "$address.city",
          pinCode: "$address.pinCode",
          landmark: "$address.landmark",
          state: "$address.state",
          country: "$address.country",
        },
      },
      {
        $unset: ["address"],
      },
    ]);

    return ledgerData[0];
  }

  static async getLimitedFields() {
    const pipeline = [
      {
        $project: {
          name: "$companyName",
        },
      },
    ];

    return await this.Model.aggregate(pipeline);
  }
}

export default LedgerService;
