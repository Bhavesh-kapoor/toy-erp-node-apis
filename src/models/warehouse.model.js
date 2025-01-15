import mongoose from "mongoose";
import Product from "#models/product";
import BaseSchema from "#models/base";
import { addressSchema } from "#models/user";

const stockSchema = new BaseSchema({
  productId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: Product,
  },
  quantity: {
    type: Number,
    min: 0,
  },
});

// Define the Warehouse schema
const warehouseSchema = new BaseSchema({
  name: {
    type: String,
    required: true,
  },
  address: addressSchema,
  stock: {
    type: [stockSchema],
  },
});

export default mongoose.model("Warehouse", warehouseSchema);
