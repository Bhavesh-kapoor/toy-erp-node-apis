import Brand from "#models/brand";
import Service from "#services/base";
import ActivityLogService from "#services/activitylog";

class BrandService extends Service {
  static Model = Brand;
}

export default BrandService;
