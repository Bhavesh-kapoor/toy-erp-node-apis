import User from "#models/user";
import Ledger from "#models/ledger";
import Invoice from "#models/invoice";
import BaseSchema, { counter } from "#models/base";
import Quotation from "#models/quotation";
import Warehouse from "#models/warehouse";
import mongoose, { Schema } from "mongoose";

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

packingSchema.post("save", async function (doc, next) {
  if (doc.packingNo) return next();
  const countData = await counter;
  countData.packing += 1;
  doc.packingNo = `P-NO-${countData.packing + 1100}`;
  await countData.save();
  await doc.save();
  next();
});

const Packing = mongoose.model("Packing", packingSchema);

export default Packing;
