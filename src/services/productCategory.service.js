import Service from "#services/base";
import httpStatus from "#utils/httpStatus";
import ProductCategory from "#models/productCategory";

class ProductCategoryService extends Service {
  static Model = ProductCategory;

  static async getSelectedCategories(fields) {
    const categoryData = await this.Model.find().select("id name");
    return categoryData;
  }
}

export default ProductCategoryService;
