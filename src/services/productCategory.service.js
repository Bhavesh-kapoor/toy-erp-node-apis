import Service from "#services/base";
import httpStatus from "#utils/httpStatus";
import ProductCategory from "#models/productCategory";

class ProductCategoryService extends Service {
  static Model = ProductCategory;
}

export default ProductCategoryService;
