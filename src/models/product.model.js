import Brand from "#models/brand";
import BaseSchema from "#models/base";
import ProductUom from "#models/productUom";
import mongoose, { Schema } from "mongoose";
import uploadFile from "#utils/uploadFile";
import ProductCategory from "#models/productCategory";

export const productTypeArr = ["Finished", "Raw Material"];

// FIX: Has to be addressed to function properly
const imagesSchema = new BaseSchema(
  {
    name: {
      type: String,
    },
    image: {
      type: String,
      file: true,
    },
  },
  { timestamps: false },
);

const productSchema = new BaseSchema(
  {
    productCode: {
      type: String,
      required: true,
		unique:true
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
      unique: true,
      required: true,
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
      required: true,
    },
    uom: {
      type: Schema.Types.ObjectId,
      ref: ProductUom,
      required: true,
    },
    description: {
      type: String,
    },
    baseQuantity: {
      type: Number,
      min: 1,
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
    sgst: {
      type: Number,
      min: 0,
    },
    cgst: {
      type: Number,
      min: 0,
    },
    igst: {
      type: Number,
      min: 0,
    },
    status: {
      type: Boolean,
      default: false,
      required: true,
    },
    sku: {
      type: String,
      required: true,
      unique: true,
    },
    coverImage: {
      type: String,
      file: true,
    },
    images: {
      type: [imagesSchema],
    },
  },
  { timestamps: true },
);

imagesSchema.pre("save", uploadFile);

export default mongoose.model("Product", productSchema);
