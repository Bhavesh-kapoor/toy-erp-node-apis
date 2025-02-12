import mongoose from "mongoose";
import BaseSchema from "#models/base";
import AutoIncrementFactory from "mongoose-sequence";

// Initialize AutoIncrement
const AutoIncrement = AutoIncrementFactory(mongoose);

const invoiceSchema = new BaseSchema(
  {
    billNumber: {
      type: Number,
      unique: true,
    },
    billDate: {
      type: Date,
      required: true,
      default: new Date(),
    },
    invoiceTo: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Ledger",
      required: true,
    },
    referenceNo: {
      type: String,
      required: true,
    },
    shipTo: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Ledger",
      required: true,
    },
    remarks: {
      type: String,
    },
    vehicleDetails: {
      type: String,
    },
    driverName: {
      type: String,
    },
    driverPhone: {
      type: String,
    },
    dispatchMode: {
      type: String,
      enum: ["Air", "Road", "Sea", "Rail"],
    },
    preparedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    placeOfSupply: {
      type: String,
    },
    transportThrough: {
      type: String,
    },
    grOrLrNumber: {
      type: String,
    },
    quotationId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Quotation",
      required: true,
    },
  },
  { timestamps: true },
);

invoiceSchema.plugin(AutoIncrement, {
  inc_field: "billNumber",
  start_seq: 1000,
});

const Invoice = mongoose.model("Invoice", invoiceSchema);

export default Invoice;
