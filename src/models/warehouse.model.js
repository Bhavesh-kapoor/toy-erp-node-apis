import mongoose from "mongoose";
import Product from "#models/product";
import BaseSchema from "#models/base";
import { addressSchema } from "#models/user";

// Define the Warehouse schema
const warehouseSchema = new BaseSchema({
  name: {
    type: String,
    required: true,
  },
  address: addressSchema,
  stock: {
    type: Map,
    of: {
      type: Number,
      min: 0,
    },
  },
});

export default mongoose.model("Warehouse", warehouseSchema);
