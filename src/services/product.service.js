import httpStatus from "#utils/httpStatus";
import Product from "#models/product";

export const getProduct = async (id, filter = {}) => {
  if (!id) {
    const productData = await Product.find(filter);
    return productData;
  }
  const productData = await Product.findById(id).populate("parentCategory");
  return productData;
};

export const createProduct = async (productData) => {
  const product = await Product.create(productData);
  return product;
};

export const updateProduct = async (id, updates) => {
  const product = await Product.findById(id);
  for (const key in updates) {
    product[key] = updates[key];
  }

  await product.save();
  return product;
};

export const deleteProduct = async (id) => {
  const existingProduct = await Product.findByIdAndDelete(id);
  return true;
};
