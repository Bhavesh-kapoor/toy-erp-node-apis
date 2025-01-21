import Warehouse from "#models/warehouse";
import Service from "#services/base";
import mongoose from "mongoose";
import ProductService from "#services/product";

class WarehouseService extends Service {
  static Model = Warehouse;

  static async get(id, filter) {
    const initialStage = [];
    const extraStage = [
      {
        $project: {
          name: 1,
          state: "$address.state",
          city: "$address.city",
          createdAt: 1,
          updatedAt: 1,
        },
      },
    ];
    if (!id) {
      return this.Model.findAll(filter, initialStage, extraStage);
    }

    const pipeline = [
      {
        $match: {
          _id: new mongoose.Types.ObjectId(id),
        },
      },
      {
        $project: {
          name: 1,
          state: "$address.state",
          city: "$address.city",
          line1: "$address.line1",
          landmark: "$address.landmark",
          pinCode: "$address.pinCode",
          country: "$address.country",
          street: "$address.street",
          stock: 1,
          createdAt: 1,
          updatedAt: 1,
        },
      },
    ];

    const warehouseData = await this.Model.aggregate(pipeline);
    return warehouseData[0];
  }

  static async getLimitedFields(filters = {}) {
    const pipeline = [
      {
        $match: filters,
      },
      {
        $project: {
          name: 1,
        },
      },
    ];

    return await this.Model.aggregate(pipeline);
  }

  static async getStockWithWarehouseId(id) {
    const productData = ProductService.getWithAggregate([
      {
        $project: {
          name: 1,
          sku: 1,
          mrp: 1,
          productCode: 1,
        },
      },
    ]);

    const warehouseData = this.Model.findDocById(id);
    const [warehouse, product] = await Promise.all([
      warehouseData,
      productData,
    ]);

    const { stock } = warehouse;

    product.forEach((ele) => {
      ele.stockInHand = stock.get(ele._id) ?? 0;
    });

    return {
      product,
    };
  }
}

export default WarehouseService;
