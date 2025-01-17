import Purchase from "#models/purchase";
import Service from "#services/base";

class PurchaseService extends Service {
  static Model = Purchase;

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
