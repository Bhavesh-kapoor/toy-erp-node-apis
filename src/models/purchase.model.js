import mongoose from "mongoose";
import Ledger from "#models/ledger";
import BaseSchema from "#models/base";
import Warehouse from "#models/warehouse";
import User from "#models/user";
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
  warehouseId: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    ref: Warehouse,
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
  cgstAmount: {
    type: Number,
    min: 0,
  },
  sgstAmount: {
    type: Number,
    min: 0,
  },
  igstAmount: {
    type: Number,
    min: 0,
  },
  netAmount: {
    type: Number,
  },
  stockAdded: {
    type: Boolean,
    default: false,
    required: true,
  },
  preparedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: User,
    required: true,
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
