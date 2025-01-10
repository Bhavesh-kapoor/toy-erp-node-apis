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
  parentCategory: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "ProductCategory",
  },
  //TODO: Has to be addressed

  status: {
    type: Boolean,
    required: true,
    default: false,
  },
});

export default mongoose.model("ProductCategory", productCategorySchema);
