import Service from "#services/base";
import Packing from "#models/packing";

class PackingService extends Service {
  static Model = Packing;

  static async create(packingData) {
    const productIds = packingData.products.map((ele) => ele.id);
  }
}

export default PackingService;
