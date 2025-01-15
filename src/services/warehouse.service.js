import Warehouse from "#models/warehouse";
import Service from "#services/base";
import mongoose from "mongoose";

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
          pinCode: "$address.pinCode",
          country: "$address.country",
          street: "$address.street",
          stock: 1,
          createdAt: 1,
          updatedAt: 1,
        },
      },
    ];

    return await this.Model.aggregate(pipeline)[0];
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
}

export default WarehouseService;
