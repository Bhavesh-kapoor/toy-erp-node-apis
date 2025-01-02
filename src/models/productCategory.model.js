import mongoose from "mongoose";

const { Schema } = mongoose;

const productCategorySchema = new Schema(
  {
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
    parentCategory: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "ProductCategory",
    },
  },
  { timestamps: true },
);

export default mongoose.model("ProductCategory", productCategorySchema);
