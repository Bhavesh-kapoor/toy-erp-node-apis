import httpStatus from "#utils/httpStatus";
import Brand from "#models/brand";

export const getBrand = async (id, filter = {}) => {
  if (!id) {
    const brandData = await Brand.find(filter);
    return brandData;
  }
  const brandData = await Brand.findById(id);
  return brandData;
};

export const createBrand = async (brandData) => {
  const brand = await Brand.create(brandData);
  return brand;
};

export const updateBrand = async (id, updates) => {
  const brand = await Brand.findById(id);
  for (const key in updates) {
    brand[key] = updates[key];
  }

  await brand.save();
  return brand;
};

export const deleteBrand = async (id) => {
  const existingBrand = await Brand.findByIdAndDelete(id);
  return true;
};
