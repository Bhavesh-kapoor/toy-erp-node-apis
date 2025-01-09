import Brand from "#models/brand";
import Service from "#services/base";

class BrandService extends Service {
  static Model = Brand;

  static async getSelectedBrands(fields) {
    const brandData = await this.Model.find().select("id name");
    return brandData;
  }
}

export default BrandService;
