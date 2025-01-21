import mongoose from "mongoose";
import Service from "#services/base";
import ItemTransfer from "#models/itemTransfer";
import WarehouseService from "#services/warehouse";
import httpStatus from "#utils/httpStatus";

class ItemTransferService extends Service {
  static Model = ItemTransfer;

  static async get(id, filter) {
    if (id) {
      return await this.Model.findDocById(id);
    }

    const initialStage = [
      {
        $lookup: {
          from: "warehouses",
          localField: "issueFrom",
          foreignField: "_id",
          as: "oldWarehouse",
        },
      },
      {
        $lookup: {
          from: "warehouses",
          localField: "issueTo",
          foreignField: "_id",
          as: "newWarehouse",
        },
      },
    ];

    const extraStage = [
      {
        $project: {
          from: { $arrayElemAt: ["$oldWarehouse.name", 0] },
          to: { $arrayElemAt: ["$newWarehouse.name", 0] },
          netAmount: 1,
          issueDate: 1,
          issueNumber: 1,
          totalQuantity: 1,
        },
      },
    ];

    return await this.Model.findAll(filter, initialStage, extraStage);
  }

  static async create(itemTransferData) {
    const { issueFrom, issueTo, stock } = itemTransferData;

    const oldWarehouseData = WarehouseService.getDocById(issueFrom);
    const newWarehouseData = WarehouseService.getDocById(issueTo);

    const [oldWarehouse, newWarehouse] = await Promise.all([
      oldWarehouseData,
      newWarehouseData,
    ]);

    const { stock: oldStock } = oldWarehouse;
    const { stock: newStock } = newWarehouse;

    for (let id in stock) {
      const existingStock = oldStock.get(id);

      if (!existingStock || existingStock < stock[id]) {
        throw {
          status: false,
          message: `Insufficient stock for product with the id ${id}`,
          httpStatus: httpStatus.BAD_REQUEST,
        };
      }

      oldStock.set(id, existingStock - stock[id]);
      newStock.set(id, (newStock.get(id) ?? 0) + stock[id]);
    }

    const itemTransferEntry = await this.Model.create(itemTransferData);
    await oldWarehouse.save();
    await newWarehouse.save();

    return itemTransferEntry;
  }

  static async getBaseFields() {
    const warehouses = await WarehouseService.getWithAggregate([
      {
        $project: {
          name: 1,
        },
      },
    ]);

    return {
      warehouses,
    };
  }

  static async update(id, updates) {}
}

export default ItemTransferService;
