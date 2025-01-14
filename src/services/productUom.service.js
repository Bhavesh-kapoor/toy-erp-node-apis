import ProductUom from "#models/productUom";
import Service from "#services/base";

class ProductUomService extends Service {
  static Model = ProductUom;

  static async getSelectedFields() {
    return await this.Model.aggregate([
      {
        $project: {
          shortName: 1,
        },
      },
    ]);
  }
}

export default ProductUomService;
