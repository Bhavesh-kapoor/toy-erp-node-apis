import httpStatus from "#utils/httpStatus";
import ProductCategory from "#models/productCategory";

export const getProductCategory = async (id, filter = {}) => {
  if (!id) {
    const productCategoryData = await ProductCategory.find(filter);
    return productCategoryData;
  }
  const productCategoryData = await ProductCategory.findById(id);
  return productCategoryData;
};

export const createProductCategory = async (productCategoryData) => {
  const productCategory = await ProductCategory.create(productCategoryData);
  return productCategory;
};

export const updateProductCategory = async (id, updates) => {
  const productCategory = await ProductCategory.findById(id);

  for (const key in updates) {
    productCategory[key] = updates[key];
  }

  await productCategory.save();
  return productCategory;
};

export const deleteProductCategory = async (id) => {
  const existingProductCategory = await ProductCategory.findByIdAndDelete(id);
  return true;
};
