import mongoose from "mongoose";
import Service from "#services/base";
import ItemTransfer from "#models/itemTransfer";
import WarehouseService from "#services/warehouse";

class ItemTransferService extends Service {
  static Model = ItemTransfer;

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
      if (!existingStock || !existingStock < stock[id]) {
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

  static async update(id, updates) {}
}

export default ItemTransferService;
