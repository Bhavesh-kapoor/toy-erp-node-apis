import User from "#models/user";
import Ledger from "#models/ledger";
import BaseSchema from "#models/base";
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
  packed: {
    type: Boolean,
    default: false,
  },
});

packingSchema.post("save", async function (doc, next) {
  if (doc.packingNo) return next();
  const packingCount = await Packing.countDocuments();
  doc.packingNo = `P-NO-${packingCount + 1000}`;
  await doc.save();
  next();
});

const Packing = mongoose.model("Packing", packingSchema);

export default Packing;
