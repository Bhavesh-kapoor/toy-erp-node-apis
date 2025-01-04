import Brand from "#models/brand";
import httpStatus from "#utils/httpStatus";
import ProductUom from "#models/productUom";
import mongoose, { Schema } from "mongoose";
import ProductCategory from "#models/productCategory";
import BaseSchema from "#models/base";

export const productTypeArr = ["Finished", "Raw Material"];

const productSchema = new BaseSchema(
  {
    productCode: {
      type: String,
      required: true,
    },
    type: {
      type: String,
      enum: productTypeArr,
      required: true,
    },
    name: {
      type: String,
      required: true,
    },
    barCode: {
      type: String,
    },
    productSeries: {
      type: String,
      required: true,
    },
    productCategory: {
      type: Schema.Types.ObjectId,
      ref: ProductCategory,
      required: true,
    },
    brand: {
      type: Schema.Types.ObjectId,
      ref: Brand,
    },
    uom: {
      type: Schema.Types.ObjectId,
      ref: ProductUom,
    },
    description: {
      type: String,
    },
    baseQuantity: {
      type: Number,
    },
    weight: {
      type: Number,
      default: 0,
    },
    grossWeight: {
      type: Number,
      default: 0,
    },
    purchaseRate: {
      type: Number,
    },
    yob: {
      type: Number,
    },
    cb: {
      type: Number,
    },
    ourPrice: {
      type: Number,
    },
    minLevel: {
      type: Number,
    },
    maxLevel: {
      type: Number,
    },
    mrp: {
      type: Number,
    },
    reOrderLevel: {
      type: Number,
    },
    buyerRefNo: {
      type: String,
    },
    isTaxed: {
      type: Boolean,
      reuqired: true,
      default: false,
    },
    sku: {
      type: String,
      required: true,
      unique: true,
    },
    description: {
      type: String,
      default: "",
    },
    manufacturer: {
      type: String,
      default: "",
    },
    dimensions: {
      type: String,
      default: "",
    },
    tags: [String],
  },
  { timestamps: true },
);

productSchema.pre("save", async function (next) {
  const productCategory = await ProductCategory.findById(this.productCategory);
  if (!productCategory) {
    throw {
      status: false,
      message: "Product category doesn't exist",
      httpStatus: httpStatus.BAD_REQUEST,
    };
  }
  next();
});

export default mongoose.model("Product", productSchema);
