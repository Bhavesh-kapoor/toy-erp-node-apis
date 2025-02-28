import Service from "#services/base";
import Product from "#models/product";
import BrandService from "#services/brand";
import httpStatus from "#utils/httpStatus";
import WarehouseService from "#services/warehouse";
import ProductUomService from "#services/productUom";
import ProductCategoryService from "#services/productCategory";

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

  static async getStock(id) {
    const data = await this.Model.findDocById(id);
    const warehouse = await WarehouseService.getWithAggregate([
      { $project: { stock: 1, name: 1 } },
    ]);

    const output = warehouse.map((ele) => {
      const { stock } = ele;
      const data = {
        _id: ele._id,
        name: ele.name,
        quantity: stock[id] ?? 0,
      };
      return data;
    });

    const fakePagination = {
      result: output,
      pagination: {
        totalPages: 1,
        totalItems: output.length,
        currentpage: 1,
        itemsPerPage: output.length,
      },
    };

    return fakePagination;
  }

  static async searchWithNameAndCode(search) {
    search = search?.toString() ?? "";

    const pipeline = [
      {
        $match: {
          $or: [
            { name: { $regex: search, $options: "i" } },
            { productCode: { $regex: search, $options: "i" } },
          ],
        },
      },
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
          gst: 1,
          quotationDate: 1,
          barCode: 1,
          updatedAt: 1,
          updatedAt: 1,
          createdAt: 1,
        },
      },
    ];

    const stockData = WarehouseService.getWithAggregate([
      {
        $project: {
          name: 1,
          stock: { $objectToArray: "$stock" },
        },
      },
      {
        $unwind: "$stock",
      },
      {
        $group: {
          _id: "$stock.k",
          stock: { $sum: "$stock.v" },
        },
      },
      {
        $group: {
          _id: null,
          stockObject: {
            $push: { k: "$_id", v: "$stock" },
          },
        },
      },
      {
        $project: {
          _id: 0, // Remove `_id`
          stock: { $arrayToObject: "$stockObject" }, // Convert array to object
        },
      },
    ]);

    const productData = this.Model.aggregate(pipeline);
    const [stocks, products] = await Promise.all([stockData, productData]);

    const stockAmount = stocks[0]?.stock;

    for (let i of products) {
      const id = i._id;
      i.stockInHand = stockAmount?.[id] ?? 0;
    }
    return products;
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
          gst: 1,
          quotationDate: 1,
          barCode: 1,
          updatedAt: 1,
          updatedAt: 1,
          createdAt: 1,
        },
      },
    ];

    const stockData = WarehouseService.getWithAggregate([
      {
        $project: {
          name: 1,
          stock: { $objectToArray: "$stock" },
        },
      },
      {
        $unwind: "$stock",
      },
      {
        $group: {
          _id: "$stock.k",
          stock: { $sum: "$stock.v" },
        },
      },
      {
        $group: {
          _id: null,
          stockObject: {
            $push: { k: "$_id", v: "$stock" },
          },
        },
      },
      {
        $project: {
          _id: 0, // Remove `_id`
          stock: { $arrayToObject: "$stockObject" }, // Convert array to object
        },
      },
    ]);

    const productData = this.Model.aggregate(pipeline);
    const [stocks, products] = await Promise.all([stockData, productData]);

    const stockAmount = stocks[0]?.stock;

    for (let i of products) {
      const id = i._id;
      i.stockInHand = stockAmount?.[id] ?? 0;
    }
    return products;
  }

  static async getBaseFields() {
    const brandData = BrandService.getSelectedBrands();
    const categoryData = ProductCategoryService.getWithAggregate([
      {
        $project: {
          name: 1,
          gst: 1,
        },
      },
    ]);
    const uomData = ProductUomService.getWithAggregate([
      {
        $project: {
          name: "$shortName",
        },
      },
    ]);

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
    const { productCategory } = productData;
    const category = await ProductCategoryService.getDocById(productCategory);
    if (!category.gst && category.gst !== 0) category.gst = 18;
    productData.gst = category.gst;
    await category.save();
    const product = await this.Model.create(productData);
    return product;
  }

  static async update(id, updates) {
    const product = await this.Model.findDocById(id);
    const { productCategory } = product;
    const category = await ProductCategoryService.getDocById(productCategory);
    if (!category.gst && category.gst !== 0) category.gst = 18;
    await category.save();
    product.update(updates);
    product.gst = category.gst;
    await product.save();
    return product;
  }
}

export default ProductService;
