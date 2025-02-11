import Expense from "#models/expense";
import httpStatus from "#utils/httpStatus";
import Service from "#services/base";
import UserService from "#services/user";

class ExpenseService extends Service {
  static Model = Expense;

  static async getBaseFields() {
    const data = await UserService.getWithAggregate([
      {
        $project: {
          name: 1,
        },
      },
    ]);

    return data;
  }
}

export default ExpenseService;
