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

    const now = new Date(); // Get current time

    // Today and Yesterday
    const startOfToday = new Date();
    startOfToday.setHours(0, 0, 0, 0);

    const startOfYesterday = new Date(startOfToday);
    startOfYesterday.setDate(startOfYesterday.getDate() - 1);

    const endOfYesterday = new Date(startOfYesterday);
    endOfYesterday.setHours(
      now.getHours(),
      now.getMinutes(),
      now.getSeconds(),
      now.getMilliseconds(),
    ); // Match current time

    // Current Week and Last Week
    const startOfCurrentWeek = new Date();
    startOfCurrentWeek.setHours(0, 0, 0, 0);
    startOfCurrentWeek.setDate(
      startOfCurrentWeek.getDate() - startOfCurrentWeek.getDay(),
    ); // Sunday start

    const startOfLastWeek = new Date(startOfCurrentWeek);
    startOfLastWeek.setDate(startOfLastWeek.getDate() - 7);

    const endOfLastWeek = new Date(startOfLastWeek);
    endOfLastWeek.setDate(endOfLastWeek.getDate() + 6); // Move to the last day of last week
    endOfLastWeek.setHours(
      now.getHours(),
      now.getMinutes(),
      now.getSeconds(),
      now.getMilliseconds(),
    ); // Match current time

    // Current Month and Last Month
    const startOfCurrentMonth = new Date();
    startOfCurrentMonth.setHours(0, 0, 0, 0);
    startOfCurrentMonth.setDate(1); // Start of current month

    const startOfLastMonth = new Date(startOfCurrentMonth);
    startOfLastMonth.setMonth(startOfLastMonth.getMonth() - 1);

    const endOfLastMonth = new Date(startOfLastMonth);
    endOfLastMonth.setMonth(endOfLastMonth.getMonth() + 1, 0); // Last day of last month
    endOfLastMonth.setHours(
      now.getHours(),
      now.getMinutes(),
      now.getSeconds(),
      now.getMilliseconds(),
    ); // Match current time

    // Current Year and Last Year
    const startOfCurrentYear = new Date();
    startOfCurrentYear.setHours(0, 0, 0, 0);
    startOfCurrentYear.setMonth(0, 1); // Start of the year (January 1st)

    const startOfLastYear = new Date(startOfCurrentYear);
    startOfLastYear.setFullYear(startOfLastYear.getFullYear() - 1);

    const endOfLastYear = new Date(startOfLastYear);
    endOfLastYear.setFullYear(endOfLastYear.getFullYear() + 1, 0, 0); // Last day of last year
    endOfLastYear.setHours(
      now.getHours(),
      now.getMinutes(),
      now.getSeconds(),
      now.getMilliseconds(),
    ); // Match current time

    // Expense Queries
    const todayExpense = this.getTotalExpense({ startDate: startOfToday });
    const yesterdayExpense = this.getTotalExpense({
      startDate: startOfYesterday,
      endDate: endOfYesterday,
    });

    const currentWeekExpense = this.getTotalExpense({
      startDate: startOfCurrentWeek,
    });
    const lastWeekExpense = this.getTotalExpense({
      startDate: startOfLastWeek,
      endDate: endOfLastWeek,
    });

    const currentMonthExpense = this.getTotalExpense({
      startDate: startOfCurrentMonth,
    });
    const lastMonthExpense = this.getTotalExpense({
      startDate: startOfLastMonth,
      endDate: endOfLastMonth,
    });

    const currentYearExpense = this.getTotalExpense({
      startDate: startOfCurrentYear,
    });
    const lastYearExpense = this.getTotalExpense({
      startDate: startOfLastYear,
      endDate: endOfLastYear,
    });

    const totalExpense = this.getTotalExpense({});

    const [
      expenseData,
      todayData,
      yesterdayData,
      currentWeekData,
      lastWeekData,
      currentMonthData,
      lastMonthData,
      currentYearData,
      lastYearData,
      totalData,
    ] = await Promise.all([
      data,
      todayExpense,
      yesterdayExpense,
      currentWeekExpense,
      lastWeekExpense,
      currentMonthExpense,
      lastMonthExpense,
      currentYearExpense,
      lastYearExpense,
      totalExpense,
    ]);

    return {
      ...expenseData,
      today: todayData[0]?.total ?? null,
      yesterday: yesterdayData[0]?.total ?? null,
      currentWeek: currentWeekData[0]?.total ?? null,
      lastWeek: lastWeekData[0]?.total ?? null,
      currentMonth: currentMonthData[0]?.total ?? null,
      lastMonth: lastMonthData[0]?.total ?? null,
      currentYear: currentYearData[0]?.total ?? null,
      lastYear: lastYearData[0]?.total ?? null,
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

export default ExpenseService;
