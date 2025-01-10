import mongoose from "mongoose";
import BaseSchema from "#models/base";

const PurchaseOrderSchema = new BaseSchema({
  purchaseNumber: {
    type: String,
    unique: true,
  },
  purchaseDate: {
    type: Date,
    required: true,
  },
  vendor: {
    type: String,
    required: true,
  },
  remarks: {
    type: String,
  },
  referenceNumber: {
    type: String,
    required: true,
  },
  poNumber: {
    type: String,
  },
  poDate: {
    type: Date,
  },

  // TODO: this has to be fixed
  products: [
    {
      productCode: { type: String, required: true },
      description: { type: String, required: true },
      uom: { type: String, required: true },
      hsn: { type: String, required: true },
      quantity: { type: Number, required: true },
      rate: { type: Number, required: true },
      value: { type: Number, required: true },
      discountPercentage: { type: Number },
      discountAmount: { type: Number },
      cgstPercentage: { type: Number },
      cgstAmount: { type: Number },
      sgstPercentage: { type: Number },
      sgstAmount: { type: Number },
      netValue: { type: Number, required: true },
    },
  ],
  paymentMode: {
    type: String,
    required: true,
  },
});

// Create and export the model
export default mongoose.model("PurchaseOrder", PurchaseOrderSchema);
