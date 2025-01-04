import mongoose from "mongoose";
import BaseSchema from "#models/base";

const productCategorySchema = new BaseSchema({
  name: {
    type: String,
    required: true,
    unique: true,
  },
  description: {
    type: String,
  },
  hsnCode: {
    type: String,
    required: true,
  },
  igst: {
    type: Number,
    min: 0,
    deafult: 0,
  },
  cgst: {
    type: Number,
    min: 0,
  },
  sgst: {
    type: Number,
    min: 0,
  },
  parentCategory: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "ProductCategory",
  },
});

export default mongoose.model("ProductCategory", productCategorySchema);
