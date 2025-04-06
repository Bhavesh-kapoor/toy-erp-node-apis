import httpStatus from "#utils/httpStatus";
import LedgerService from "#services/ledger";
import ExpenseService from "#services/expense";
import InvoiceService from "#services/invoice";
import QuotationService from "#services/quotation";

class DashboardService {
  static async get(filters) {
    const stripTime = (date) => new Date(date.toDateString());

    const currentDate = stripTime(new Date());
    const lastDate = new Date(currentDate);
    lastDate.setDate(currentDate.getDate() - 7);

    const { startDate = lastDate, endDate = currentDate } = filters;

    if (!startDate || !endDate) {
      throw {
        status: false,
        message: "Invalid Date filters",
        httpStatus: httpStatus.BAD_REQUEST,
      };
    }

    const start = stripTime(new Date(startDate));
    const end = stripTime(new Date(endDate));

    if (start > end) {
      throw {
        status: false,
        message: "Start date must be before end date",
        httpStatus: httpStatus.BAD_REQUEST,
      };
    }

    const rangeDiffInMs = end - start;
    const previousStart = new Date(start.getTime() - rangeDiffInMs);
    const previousEnd = new Date(end.getTime() - rangeDiffInMs);

    const currentFilters = { startDate: start, endDate: end };
    const previousFilters = { startDate: previousStart, endDate: previousEnd };

    const [
      currentQuotations,
      currentBillings,
      currentLedgers,
      currentExpenses,
      previousQuotations,
      previousBillings,
      previousLedgers,
      previousExpenses,
    ] = await Promise.all([
      this.getQuotationData(currentFilters),
      this.getBillingData(currentFilters),
      this.getLedgerData(currentFilters),
      this.getExpenseData(currentFilters),
      this.getQuotationData(previousFilters),
      this.getBillingData(previousFilters),
      this.getLedgerData(previousFilters),
      this.getExpenseData(previousFilters),
    ]);

    const formatResult = (quotations, billings, ledgers, expenses) => ({
      totalDeals: quotations?.total ?? 0,
      conversionRatio: quotations.total
        ? ((quotations.approved / quotations.total) * 100).toFixed(2)
        : "0.00",
      totalRevenue: billings?.total ?? 0,
      activeUsers: ledgers?.total ?? 0,
      totalExpenses: expenses?.total ?? 0,
    });

    const calculateChange = (current, previous) => {
      if (previous === 0 && current !== 0) return "+100.00";
      if (previous === 0 && current === 0) return "0.00";
      const change = ((current - previous) / previous) * 100;
      return `${change >= 0 ? "+" : ""}${change.toFixed(2)}`;
    };

    const current = formatResult(
      currentQuotations,
      currentBillings,
      currentLedgers,
      currentExpenses,
    );
    const previous = formatResult(
      previousQuotations,
      previousBillings,
      previousLedgers,
      previousExpenses,
    );

    const difference = {
      totalDeals: calculateChange(current.totalDeals, previous.totalDeals),
      conversionRatio: calculateChange(
        parseFloat(current.conversionRatio),
        parseFloat(previous.conversionRatio),
      ),
      totalRevenue: calculateChange(
        current.totalRevenue,
        previous.totalRevenue,
      ),
      activeUsers: calculateChange(current.activeUsers, previous.activeUsers),
      totalExpenses: calculateChange(
        current.totalExpenses,
        previous.totalExpenses,
      ),
    };

    return {
      currentPeriod: current,
      previousPeriod: previous,
      difference,
    };
  }

  static async getQuotationData(filters) {
    const result = await QuotationService.getWithAggregate([
      {
        $match: {
          quotationDate: {
            $gte: filters.startDate,
            $lte: filters.endDate,
          },
        },
      },
      {
        $group: {
          _id: null,
          total: { $sum: 1 },
          approved: {
            $sum: {
              $cond: [{ $eq: ["$status", "Approved"] }, 1, 0],
            },
          },
        },
      },
    ]);

    return {
      approved: result[0]?.approved ?? 0,
      total: result[0]?.total ?? 0,
    };
  }

  static async getBillingData(filters) {
    const result = await InvoiceService.getWithAggregate([
      {
        $lookup: {
          from: "quotations",
          localField: "quotationId",
          foreignField: "_id",
          as: "quotationData",
        },
      },
      {
        $project: {
          quotation: { $arrayElemAt: ["$quotationData", 0] },
        },
      },
      {
        $match: {
          "quotation.quotationDate": {
            $gte: filters.startDate,
            $lte: filters.endDate,
          },
        },
      },
      {
        $group: {
          _id: null,
          total: { $sum: "$quotation.netAmount" },
        },
      },
    ]);

    return result[0] ?? { total: 0 };
  }

  static async getLedgerData(filters) {
    const result = await LedgerService.getWithAggregate([
      {
        $match: {
          createdAt: {
            $gte: filters.startDate,
            $lte: filters.endDate,
          },
        },
      },
      {
        $group: {
          _id: "$_id",
        },
      },
      {
        $count: "total",
      },
    ]);

    return result[0] ?? { total: 0 };
  }

  static async getExpenseData(filters) {
    const result = await ExpenseService.getWithAggregate([
      {
        $match: {
          expenseDate: {
            $gte: filters.startDate,
            $lte: filters.endDate,
          },
        },
      },
      {
        $group: {
          _id: null,
          total: { $sum: "$amount" },
        },
      },
    ]);

    return result[0] ?? { total: 0 };
  }
}

export default DashboardService;
