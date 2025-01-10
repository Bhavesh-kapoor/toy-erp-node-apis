import User from "#models/user";
import Ledger from "#models/ledger";
import BaseSchema from "#models/base";
import Quotation from "#models/quotation";
import mongoose, { Schema } from "mongoose";

const productSchema = new Schema({
  id: {
    type: mongoose.Schema.Types.ObjectId,
  },
  quotationQuantity: {
    type: Number,
  },
  packingQuantity: {
    type: Number,
  },
});

const packingSchema = new BaseSchema({
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
});

export default mongoose.model("Packing", packingSchema);
