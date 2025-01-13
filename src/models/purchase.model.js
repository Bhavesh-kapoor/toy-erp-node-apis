import mongoose from "mongoose";
import Ledger from "#models/ledger";
import BaseSchema from "#models/base";
import { itemSchema } from "#models/quotation";

const purchaseOrderSchema = new BaseSchema({
  purchaseNo: {
    type: String,
    unique: true,
  },
  purchaseDate: {
    type: Date,
    required: true,
  },
  vendor: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    ref: Ledger,
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
  products: [itemSchema],
  paymentMode: {
    type: String,
    enum: ["Cash", "Cheuqe", "NEFT"],
    required: true,
  },
  totalQuantity: {
    type: Number,
    required: true,
    min: 1,
  },
  totalValue: {
    type: Number,
    required: true,
    min: 1,
  },
  discountAmount: {
    type: Number,
    min: 0,
  },
  additionalDiscountPercentage: {
    type: Number,
    min: 0,
  },
  additionalDiscountAmount: {
    type: Number,

    min: 0,
  },
  freight: {
    type: Number,
  },
  cgst: {
    type: Number,
    min: 0,
  },
  sgst: {
    type: Number,
    min: 0,
  },
  igst: {
    type: Number,
    min: 0,
  },
  netAmount: {
    type: Number,
  },
});

purchaseOrderSchema.post("save", async function (doc, next) {
  if (doc.purchaseNo) return next();
  const purchaseCount = await Purchase.countDocuments();
  doc.purchaseNo = `PU-NO-${purchaseCount + 1000}`;
  await doc.save();
  next();
});

const Purchase = mongoose.model("Purchase", purchaseOrderSchema);

// Create and export the model
export default Purchase;
