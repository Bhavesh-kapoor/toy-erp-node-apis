import mongoose from "mongoose";
import BaseSchema from "#models/base";

const productUomSchema = new BaseSchema(
  {
    name: {
      type: String,
      required: true,
      unique: true,
    },
    description: {
      type: String,
      required: true,
    },
  },
  { timestamps: true },
);

export default mongoose.model("ProductUom", productUomSchema);
