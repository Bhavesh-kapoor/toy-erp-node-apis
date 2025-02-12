import Expense from "#models/expense";
import mongoose from "mongoose";
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

    const data = this.Model.findAll(filter, initialStage, extraStage);

    const startOfToday = new Date();
    startOfToday.setHours(0, 0, 0, 0);

    const todayExpense = this.getTotalExpense({ startDate: startOfToday });

    const startOfLast7Days = new Date();
    startOfLast7Days.setHours(0, 0, 0, 0);
    startOfLast7Days.setDate(startOfLast7Days.getDate() - 7);

    const last7DayExpense = this.getTotalExpense({
      startDate: startOfLast7Days,
    });

    const startOfLast30Days = new Date();
    startOfLast30Days.setHours(0, 0, 0, 0);
    startOfLast30Days.setDate(startOfLast30Days.getDate() - 30);

    const last30DayExpense = this.getTotalExpense({
      startDate: startOfLast30Days,
    });

    const totalExpense = this.getTotalExpense({});

    const [expenseData, todayData, last7DayData, last30DayData, totalData] =
      await Promise.all([
        data,
        todayExpense,
        last7DayExpense,
        last30DayExpense,
        totalExpense,
      ]);

    return {
      ...expenseData,
      today: todayData[0]?.total ?? null,
      last7Days: last7DayData[0]?.total ?? null,
      last30Days: last30DayData[0]?.total ?? null,
      total: totalData[0]?.total ?? null,
    };
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

  static async getTotalExpense(filters = {}) {
    const { endDate, startDate, userId } = filters;

    const matchStage = {};
    const pipeline = [];

    pipeline.push({ $match: matchStage });

    delete filters.search;
    delete filters.searchkey;

    if (userId) {
      matchStage.userId = new mongoose.Types.ObjectId(userId);
      delete filters.userId;
    }

    if (startDate || endDate) {
      matchStage.date = {};
      if (startDate) matchStage.date.$gte = startDate;
      if (endDate) matchStage.date.$lte = endDate;
      delete filters.startDate;
      delete filters.endDate;
    }

    delete filters.sortkey;
    delete filters.sortdir;
    delete filters.page;
    delete filters.limit;

    pipeline.push({
      $group: {
        _id: null,
        total: { $sum: "$amount" },
      },
    });

    const totalAmount = await Expense.aggregate(pipeline);
    return totalAmount;
  }
}
ExpenseService.getTotalExpense({ userId: "678f8619a4baf2ad3fde2039" })
  .then((x) => console.log(x))
  .catch((e) => console.log(e));

export default ExpenseService;
