import mongoose from "mongoose";
import Service from "#services/base";
import Product from "#models/product";
import Warehouse from "#models/warehouse";
import ProductService from "#services/product";

class WarehouseService extends Service {
  static Model = Warehouse;

  static async get(id, filter) {
    const initialStage = [
      {
        $lookup: {
          from: "cities",
          as: "cityData",
          localField: "city",
          foreignField: "_id",
        },
      },
      {
        $lookup: {
          from: "states",
          as: "stateData",
          localField: "state",
          foreignField: "_id",
        },
      },
    ];
    const extraStage = [
      {
        $project: {
          name: 1,
          state: { $arrayElemAt: ["$stateData.name", 0] },
          city: { $arrayElemAt: ["$cityData.name", 0] },
          createdAt: 1,
          updatedAt: 1,
        },
      },
    ];
    if (!id) {
      return this.Model.findAll(filter, initialStage, extraStage);
    }

    return await super.get(id);
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

  static async getStockWithWarehouseId(id, filter) {
    const initialStage = [];
    const extraStage = [
      {
        $project: {
          name: 1,
          sku: 1,
          mrp: 1,
          productCode: 1,
        },
      },
    ];

    const productData = Product.aggregate(extraStage);

    const warehouseData = this.Model.findDocById(id);
    const [warehouse, product] = await Promise.all([
      warehouseData,
      productData,
    ]);

    const { stock } = warehouse;

    product.forEach((ele) => {
      ele.stockInHand = stock.get(ele._id) ?? 0;
    });

    const output = product.filter((ele) => ele.stockInHand);

    return output;
  }

  static async getStockWithPagination(id) {
    const initialStage = [
      {
        $match: {
          _id: new mongoose.Types.ObjectId(id),
        },
      },
    ];

    const extraStage = [];

    const data = await this.Model.findAll(fiter, initialStage, extraStage);
    return data;
  }
}

export default WarehouseService;
