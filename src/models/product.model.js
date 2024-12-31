import httpStatus from "#utils/httpStatus";
import mongoose from "mongoose";
import ProductCategory from "#models/productCategory";

const { Schema } = mongoose;

const productSchema = new Schema(
  {
    name: {
      type: String,
      required: true,
    },
    productCategory: {
      type: Schema.Types.ObjectId,
      ref: ProductCategory,
      required: true,
    },
    price: {
      type: Number,
      required: true,
    },
    sku: {
      type: String,
      required: true,
      unique: true,
    },
    quantity: {
      type: Number,
      required: true,
      min: 0,
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
    weight: {
      type: Number,
      default: 0,
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
