import Warehouse from "#models/warehouse";
import Service from "#services/base";

class WarehouseService extends Service {
  static Model = Warehouse;
}

export default WarehouseService;
