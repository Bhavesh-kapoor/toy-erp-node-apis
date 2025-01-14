import Brand from "#models/brand";
import Service from "#services/base";

class BrandService extends Service {
  static Model = Brand;

  static async getSelectedBrands(fields) {
    const brandData = await this.Model.aggregate([
      {
        $project: {
          name: 1,
        },
      },
    ]);
    return brandData;
  }
}

export default BrandService;
