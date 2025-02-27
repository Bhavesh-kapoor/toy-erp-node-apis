import mongoose from "mongoose";
import User from "#models/user";
import Ledger from "#models/ledger";
import BaseSchema from "#models/base";
import Warehouse from "#models/warehouse";
import AutoIncrementFactory from "mongoose-sequence";
import Quotation, { itemSchema } from "#models/quotation";

const AutoIncrement = AutoIncrementFactory(mongoose);

const packingSchema = new BaseSchema({
  warehouseId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: Warehouse,
    required: true,
  },
  packingNo: {
    type: Number,
    unique: true,
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
  products: {
    type: itemSchema,
  },
  packed: {
    type: Boolean,
    default: false,
    required: true,
  },
});

packingSchema.plugin(AutoIncrement, {
  inc_field: "packingNo",
  start_seq: 1000,
});

const Packing = mongoose.model("Packing", packingSchema);

export default Packing;
