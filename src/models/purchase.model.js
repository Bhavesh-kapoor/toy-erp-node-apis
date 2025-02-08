import mongoose from "mongoose";
import User from "#models/user";
import Ledger from "#models/ledger";
import Warehouse from "#models/warehouse";
import { itemSchema } from "#models/quotation";
import BaseSchema from "#models/base";

const purchaseOrderSchema = new BaseSchema({
  purchaseNo: {
    type: String,
    unique: true,
    sparse: true,
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
  gstAmount: {
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

purchaseOrderSchema.pre("save", async function (next) {
  if (this.purchaseNo) return next();
  const timestamp = Math.floor(Date.now() / 10);
  this.purchaseNo = `PU-NO-${timestamp}`;
  next();
});

const Purchase = mongoose.model("Purchase", purchaseOrderSchema);

// Create and export the model
export default Purchase;
