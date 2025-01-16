import httpStatus from "#utils/httpStatus";
import Product from "#models/product";
import Service from "#services/base";
import BrandService from "#services/brand";
import ProductCategoryService from "#services/productCategory";
import ProductUomService from "#services/productUom";

class ProductService extends Service {
  static Model = Product;

  static async get(id, filter) {
    if (id) {
      return this.Model.findDocById(id);
    }
    const initialStage = [
      {
        $lookup: {
          from: "productcategories",
          localField: "productCategory",
          foreignField: "_id",
          as: "productCategory",
        },
      },
      {
        $lookup: {
          from: "brands",
          localField: "brand",
          foreignField: "_id",
          as: "brandName",
        },
      },
    ];

    const extraStage = [
      {
        $project: {
          productCategory: { $arrayElemAt: ["$productCategory.name", 0] },
          brandName: { $arrayElemAt: ["$brandName.name", 0] },
          name: 1,
          sku: 1,
          status: 1,
          updatedAt: 1,
          isTaxed: 1,
          mrp: 1,
          _id: 1,
          quotationDate: 1,
          barCode: 1,
          updatedAt: 1,
          createdAt: 1,
          ourPrice: 1,
          productCode: 1,
        },
      },
    ];

    return this.Model.findAll(filter, initialStage, extraStage);
  }

  static async getWithoutPagination() {
    const pipeline = [
      {
        $lookup: {
          from: "productcategories",
          localField: "productCategory",
          foreignField: "_id",
          as: "productCategory",
        },
      },
      {
        $lookup: {
          from: "brands",
          localField: "brand",
          foreignField: "_id",
          as: "brandName",
        },
      },
      {
        $lookup: {
          from: "productuoms",
          localField: "uom",
          foreignField: "_id",
          as: "productUom",
        },
      },
      {
        $project: {
          productCategory: { $arrayElemAt: ["$productCategory.name", 0] },
          brandName: { $arrayElemAt: ["$brandName.name", 0] },
          uom: { $arrayElemAt: ["$productUom.shortName", 0] },
          name: 1,
          productCode: 1,
          ourPrice: 1,
          sku: 1,
          status: 1,
          isTaxed: 1,
          mrp: 1,
          _id: 1,
          cgst: 1,
          sgst: 1,
          igst: 1,
          quotationDate: 1,
          barCode: 1,
          updatedAt: 1,
          updatedAt: 1,
          createdAt: 1,
        },
      },
    ];

    const data = await this.Model.aggregate(pipeline);
    return data;
  }

  static async getBaseFields() {
    const brandData = BrandService.getSelectedBrands();
    const categoryData = ProductCategoryService.getSelectedCategories();
    const uomData = ProductUomService.getSelectedFields();

    const [brands, categories, uoms] = await Promise.all([
      brandData,
      categoryData,
      uomData,
    ]);
    return {
      brands,
      categories,
      uoms,
    };
  }

  static async create(productData) {
    const { igst, cgst, sgst } = productData;

    if (igst !== cgst + sgst) {
      throw {
        status: false,
        message: "Invalid tax values",
        httpStatus: httpStatus.BAD_REQUEST,
      };
    }

    if (igst > 50) {
      throw {
        status: false,
        message: "Please reduce the tax rate",
        httpStatus: httpStatus.BAD_REQUEST,
      };
    }

    const product = await this.Model.create(productData);
    return product;
  }
}

export default ProductService;
