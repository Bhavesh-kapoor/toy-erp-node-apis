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

    // Today and Yesterday
    const startOfToday = new Date();
    startOfToday.setHours(0, 0, 0, 0);

    const startOfYesterday = new Date(startOfToday);
    startOfYesterday.setDate(startOfYesterday.getDate() - 1);
    const endOfYesterday = new Date(startOfYesterday);
    endOfYesterday.setHours(23, 59, 59, 999); // Full yesterday

    // This Week and Last Week
    const startOfCurrentWeek = new Date(startOfToday);
    startOfCurrentWeek.setDate(startOfToday.getDate() - startOfToday.getDay()); // Sunday start

    const startOfLastWeek = new Date(startOfCurrentWeek);
    startOfLastWeek.setDate(startOfLastWeek.getDate() - 7);
    const endOfLastWeek = new Date(startOfLastWeek);
    endOfLastWeek.setDate(endOfLastWeek.getDate() + 6);
    endOfLastWeek.setHours(23, 59, 59, 999); // Full last week

    // This Month and Last Month
    const startOfCurrentMonth = new Date(startOfToday);
    startOfCurrentMonth.setDate(1);

    const startOfLastMonth = new Date(startOfCurrentMonth);
    startOfLastMonth.setMonth(startOfLastMonth.getMonth() - 1);
    const endOfLastMonth = new Date(startOfLastMonth);
    endOfLastMonth.setMonth(endOfLastMonth.getMonth() + 1, 0); // Last day of last month
    endOfLastMonth.setHours(23, 59, 59, 999); // Full last month

    // This Year and Last Year
    const startOfCurrentYear = new Date(startOfToday);
    startOfCurrentYear.setMonth(0, 1);

    const startOfLastYear = new Date(startOfCurrentYear);
    startOfLastYear.setFullYear(startOfLastYear.getFullYear() - 1);
    const endOfLastYear = new Date(startOfLastYear);
    endOfLastYear.setFullYear(endOfLastYear.getFullYear(), 11, 31);
    endOfLastYear.setHours(23, 59, 59, 999); // Full last year

    // Fetch expenses
    const [
      todayExpense,
      yesterdayExpense,
      currentWeekExpense,
      lastWeekExpense,
      currentMonthExpense,
      lastMonthExpense,
      currentYearExpense,
      lastYearExpense,
      totalExpense,
      expenseData,
    ] = await Promise.all([
      this.getTotalExpense({ startDate: startOfToday }),
      this.getTotalExpense({
        startDate: startOfYesterday,
        endDate: endOfYesterday,
      }),
      this.getTotalExpense({ startDate: startOfCurrentWeek }),
      this.getTotalExpense({
        startDate: startOfLastWeek,
        endDate: endOfLastWeek,
      }),
      this.getTotalExpense({ startDate: startOfCurrentMonth }),
      this.getTotalExpense({
        startDate: startOfLastMonth,
        endDate: endOfLastMonth,
      }),
      this.getTotalExpense({ startDate: startOfCurrentYear }),
      this.getTotalExpense({
        startDate: startOfLastYear,
        endDate: endOfLastYear,
      }),
      this.getTotalExpense({}),
      data,
    ]);

    // Extract totals or fallback to 0
    const getTotal = (data) => data[0]?.total ?? 0;

    const todayTotal = getTotal(todayExpense);
    const yesterdayTotal = getTotal(yesterdayExpense);
    const currentWeekTotal = getTotal(currentWeekExpense);
    const lastWeekTotal = getTotal(lastWeekExpense);
    const currentMonthTotal = getTotal(currentMonthExpense);
    const lastMonthTotal = getTotal(lastMonthExpense);
    const currentYearTotal = getTotal(currentYearExpense);
    const lastYearTotal = getTotal(lastYearExpense);
    const totalAllTime = getTotal(totalExpense);

    // Calculate comparisons
    const calculateChange = (current, previous) =>
      previous === 0
        ? current > 0
          ? 100
          : 0
        : ((current - previous) / previous) * 100;

    return {
      ...expenseData,
      today: todayTotal,
      thisWeek: currentWeekTotal,
      thisMonth: currentMonthTotal,
      thisYear: currentYearTotal,
      total: totalAllTime,

      comparisons: {
        todayVsYesterday: {
          value: todayTotal - yesterdayTotal,
          percentageChange: calculateChange(todayTotal, yesterdayTotal),
        },
        thisWeekVsLastWeek: {
          value: currentWeekTotal - lastWeekTotal,
          percentageChange: calculateChange(currentWeekTotal, lastWeekTotal),
        },
        thisMonthVsLastMonth: {
          value: currentMonthTotal - lastMonthTotal,
          percentageChange: calculateChange(currentMonthTotal, lastMonthTotal),
        },
        thisYearVsLastYear: {
          value: currentYearTotal - lastYearTotal,
          percentageChange: calculateChange(currentYearTotal, lastYearTotal),
        },
      },
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
