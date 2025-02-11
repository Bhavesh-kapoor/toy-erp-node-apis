import Expense from "#models/expense";
import httpStatus from "#utils/httpStatus";
import Service from "#services/base";
import UserService from "#services/user";

class ExpenseService extends Service {
  static Model = Expense;

  static async get(id, filter) {
    if (id) {
      const data = await this.Model.findDocById(id);
      return data;
    }
    const initialStage = [
      {
        $lookup: {
          from: "users",
          localField: "userId",
          foreignField: "_id",
          as: "userData",
        },
      },
    ];

    const extraStage = [
      {
        $project: {
          userName: { $arrayElemAt: ["$userData.name", 0] },
          email: { $arrayElemAt: ["$userData.email", 0] },
          date: 1,
          amount: 1,
          createdAt: 1,
          updatedAt: 1,
        },
      },
    ];

    const data = await this.Model.findAll(filter, initialStage, extraStage);
    return data;
  }

  static async getBaseFields() {
    const data = await UserService.getWithAggregate([
      {
        $project: {
          name: 1,
          email: 1,
        },
      },
    ]);

    return data;
  }
}

export default ExpenseService;
