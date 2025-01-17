import Purchase from "#models/purchase";
import Service from "#services/base";
import LedgerService from "#services/ledger";
import WarehouseService from "#services/warehouse";

class PurchaseService extends Service {
  static Model = Purchase;

  static async get(id, filter) {
    if (!id) {
      const initialStage = [
        {
          $lookup: {
            from: "ledgers",
            localField: "vendor",
            foreignField: "_id",
            as: "vendorData",
          },
        },
      ];

      const extraStage = [
        {
          $project: {
            purchaseNo: 1,
            vendorName: { $arrayElemAt: ["$vendorData.companyName", 0] },
            referenceNumber: 1,
            totalQuantity: 1,
            totalValue: 1,
            netAmount: 1,
            paymentMode: 1,
            purchaseDate: 1,
            createdAt: 1,
          },
        },
      ];

      return await this.Model.findAll(filter, initialStage, extraStage);
    }
    return await this.Model.findDocById(id);
  }

  static async getBaseFields() {
    const vendorData = LedgerService.getWithAggregate([
      {
        $match: {
          ledgerType: {
            $in: ["Supplier", "Both"],
          },
        },
      },
      {
        $project: {
          name: "$companyName",
        },
      },
    ]);

    const warehouseData = WarehouseService.getWithAggregate([
      {
        $project: {
          name: 1,
        },
      },
    ]);

    const [vendors, warehouse] = await Promise.all([vendorData, warehouseData]);

    return {
      vendors,
      warehouse,
    };
  }

  static async update(id, updates) {
    const purchase = await this.Model.getDocById(id);

    const { stockAdded } = updates;

    if (stockAdded && stockAdded !== purchase.stockAdded) {
      throw {
        status: false,
        message: "Updating stock with this route ain't allowed",
        httpStatus: httpStatus.BAD_REQUEST,
      };
    }
  }
}

export default PurchaseService;
