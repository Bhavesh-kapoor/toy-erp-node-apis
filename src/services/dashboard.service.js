import LedgerService from "#services/ledger";
import ExpenseService from "#services/expense";
import InvoiceService from "#services/invoice";
import QuotationService from "#services/quotation";

class DashboardService {
  static async get(filters) {}

  static async getQuotationData(filters) {
    const quotationData = await QuotationService.getWithAggregate([
      {
        $match: {
          status: "Approved",
        },
      },
      {
        $group: {
          _id: null,
          total: { $sum: "$netAmount" },
        },
      },
    ]);

    return quotationData;
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
    return billingData;
  }

  static async getLedgerData(filters) {
    const ledgerData = await LedgerService.getWithAggregate([
      {
        $group: {
          _id: "$_id",
          total: {
            $sum: "_id",
          },
        },
      },
    ]);
    return ledgerData;
  }
}

export default DashboardService;
