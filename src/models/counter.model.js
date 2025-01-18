import mongoose, { Schema } from "mongoose";

const counterSchema = new Schema(
  {
    quotation: {
      type: Number,
      default: 0,
      required: true,
    },
    packing: {
      type: Number,
      default: 0,
      required: true,
    },
    purchase: {
      type: Number,
      default: 0,
      required: true,
    },
    invoice: {
      type: Number,
      default: 0,
      required: true,
    },
    transaction: {
      type: Number,
      default: 0,
      required: true,
    },
    itemTransfer: {
      type: Number,
      default: 0,
      required: true,
    },
    lead: {
      type: Number,
      default: 0,
      required: true,
    },
  },
  { timestamps: true },
);

export default mongoose.model("Counter", counterSchema);
