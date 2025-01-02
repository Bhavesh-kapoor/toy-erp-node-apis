import httpStatus from "#utils/httpStatus";
import ProductUom from "#models/productUom";

export const getProductUom = async (id, filter = {}) => {
  if (!id) {
    const productUomData = await ProductUom.find(filter);
    return productUomData;
  }
  const productUomData = await ProductUom.findById(id);
  return productUomData;
};

export const createProductUom = async (productUomData) => {
  const productUom = await ProductUom.create(productUomData);
  return productUom;
};

export const updateProductUom = async (id, updates) => {
  const productUom = await ProductUom.findById(id);
  for (const key in updates) {
    productUom[key] = updates[key];
  }

  await productUom.save();
  return productUom;
};

export const deleteProductUom = async (id) => {
  const existingProductUom = await ProductUom.findByIdAndDelete(id);
  return true;
};
