import Warehouse from "#models/warehouse";
import Service from "#services/base";

class WarehouseService extends Service {
  static Model = Warehouse;

  static async get(id, filter) {
    if (id) {
      return this.Model.findDocById(id);
    }
    const initialStage = [];
    const extraStage = [
      {
        $project: {
          name: 1,
          state: "$address.state",
          city: "$address.city",
          updatedAt: 1,
        },
      },
    ];

    return this.Model.findAll(filter, initialStage, extraStage);
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
