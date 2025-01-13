import Purchase from "#models/purchase";
import Service from "#services/base";

class PurchaseService extends Service {
  static Model = Purchase;
}

export default PurchaseService;
