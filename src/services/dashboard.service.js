import LedgerService from "#services/ledger";
import ExpenseService from "#services/expense";
import InvoiceService from "#services/invoice";
import QuotationService from "#services/quotation";

class DashboardService {
  static async get(filters) {
    const calls = [
      this.getQuotationData(),
      this.getBillingData(),
      this.getLedgerData(),
    ];

    const [quotations, billings, ledgers] = await Promise.all(calls);
    return {
      totalDeals: quotations?.total,
      conversionRatio: (
        (quotations?.approved / quotations?.total) *
        100
      ).toFixed(2),
      totalRevenue: billings?.total,
      activeUsers: ledgers?.total,
    };
  }

  static async getQuotationData(filters) {
    const result = await QuotationService.getWithAggregate([
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
      approved: result[0]?.approved || 0,
      total: result[0]?.total || 0,
    };
  }

  static async getExpenseData(filters) {
    const expenseData = await ExpenseService.getWithAggregate([
      {
        $group: {
          _id: null,
          total: { $sum: "$amount" },
        },
      },
    ]);
    return expenseData;
  }

  static async getBillingData(filters) {
    const billingData = await InvoiceService.getWithAggregate([
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
        $group: {
          _id: null,
          total: {
            $sum: "$quotation.netAmount",
          },
        },
      },
    ]);
    return billingData[0];
  }

  static async getLedgerData(filters) {
    const ledgerData = await LedgerService.getWithAggregate([
      {
        $group: {
          _id: "$_id", // Group by unique _id (each ledger)
        },
      },
      {
        $count: "total", // Count the number of unique _id entries
      },
    ]);
    return ledgerData[0];
  }
}

export default DashboardService;
