import mongoose from "mongoose";
import Purchase from "#models/purchase";
import Service from "#services/base";
import LedgerService from "#services/ledger";
import WarehouseService from "#services/warehouse";
import UserService from "#services/user";

class PurchaseService extends Service {
  static Model = Purchase;

  static async get(id, filter) {
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
    if (!id) {
      return await this.Model.findAll(filter, initialStage, extraStage);
    }
    const purchaseData = await this.Model.aggregate([
      {
        $match: {
          _id: new mongoose.Types.ObjectId(id),
        },
      },
      ...initialStage,
      {
        $lookup: {
          from: "products",
          localField: "products.product",
          foreignField: "_id",
          pipeline: [
            {
              $lookup: {
                from: "productuoms",
                localField: "uom",
                foreignField: "_id",
                as: "uom",
              },
            },
            { $unwind: "$uom" },
            {
              $project: {
                _id: 0,
                name: 1,
                description: 1,
                productCode: 1,
                uom: "$uom.shortName",
              },
            },
          ],
          as: "productDetails",
        },
      },
      {
        $addFields: {
          products: {
            $map: {
              input: "$products",
              as: "product",
              in: {
                $mergeObjects: [
                  "$$product",
                  {
                    $arrayElemAt: [
                      "$productDetails",
                      {
                        $indexOfArray: [
                          "$productDetails._id",
                          "$$product.product",
                        ],
                      },
                    ],
                  },
                ],
              },
            },
          },
        },
      },
      {
        $project: {
          productDetails: 0,
          preparedByData: 0,
          customerData: 0,
          vendorData: 0,
        },
      },
    ]);

    return purchaseData[0];
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

    const preparedByData = UserService.getUserByRole("Accountant");

    const [vendors, warehouse, preparedBy] = await Promise.all([
      vendorData,
      warehouseData,
      preparedByData,
    ]);

    return {
      vendors,
      warehouse,
      preparedBy,
    };
  }

  static async update(id, updates) {
    const purchase = await this.Model.findDocById(id);

    const { stockAdded } = updates;

    if (stockAdded && stockAdded !== purchase.stockAdded) {
      throw {
        status: false,
        message: "Updating stock with this route ain't allowed",
        httpStatus: httpStatus.BAD_REQUEST,
      };
    }

    purchase.update(updates);
    await purchase.save();
    return purchase;
  }
}

export default PurchaseService;
