import mongoose from "mongoose";
import State from "#models/state";
import BaseSchema from "#models/base";
import City from "#models/city";

// Define the Warehouse schema
const warehouseSchema = new BaseSchema({
  name: {
    type: String,
    required: true,
  },
  line1: {
    type: String,
    trim: true,
  },
  street: {
    type: String,
    trim: true,
  },
  city: {
    type: BaseSchema.Types.ObjectId,
    trim: true,
    ref: City,
  },
  state: {
    type: BaseSchema.Types.ObjectId,
    trim: true,
    ref: State,
  },
  pinCode: {
    type: String,
    trim: true,
  },
  country: {
    type: String,
    trim: true,
  },
  landmark: {
    type: String,
    trim: true,
  },
  stock: {
    type: Map,
    of: {
      type: Number,
      min: 0,
    },
    default: new Map(),
  },
});

export default mongoose.model("Warehouse", warehouseSchema);
