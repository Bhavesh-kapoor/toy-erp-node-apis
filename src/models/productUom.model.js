import mongoose from "mongoose";
import BaseSchema from "#models/base";

const productUomSchema = new BaseSchema({
  shortName: {
    type: String,
    required: true,
    unique: true,
  },
  longName: {
    type: String,
    required: true,
    unique: true,
  },
  status: {
    type: Boolean,
    required: true,
    default: false,
  },
});

export default mongoose.model("ProductUom", productUomSchema);
