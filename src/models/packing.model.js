import User from "#models/user";
import Ledger from "#models/ledger";
import Invoice from "#models/invoice";
import BaseSchema from "#models/base";
import Quotation from "#models/quotation";
import Warehouse from "#models/warehouse";
import Counter from "#models/counter";
import mongoose from "mongoose";

const packingSchema = new BaseSchema({
  warehouseId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: Warehouse,
    required: true,
  },
  packingNo: {
    type: String,
  },
  customer: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    ref: Ledger,
  },
  packingDate: {
    type: Date,
    required: true,
  },
  quotationId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: Quotation,
    required: true,
  },
  invoiceId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: Invoice,
  },
  enquiryDate: {
    type: Date,
  },
  nagPacking: {
    type: Number,
    min: 0,
  },
  remarks: {
    type: String,
  },
  packedBy: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    ref: User,
  },
  transport: {
    type: String,
  },
  totalQuantity: {
    type: Number,
    min: 1,
  },
  netPackedQuantity: {
    type: Number,
    min: 1,
  },
});

packingSchema.pre("save", async function (next) {
  if (this.packingNo) return next();
  const timestamp = Math.floor(Date.now() / 10);
  this.packingNo = `P-NO-${timestamp}`;
  next();
});

const Packing = mongoose.model("Packing", packingSchema);

export default Packing;
