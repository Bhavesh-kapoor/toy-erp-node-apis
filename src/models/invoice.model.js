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
      type: String,
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
    packingId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Packing",
      required: true,
    },
    invoiceAmount: {
      type: Number,
      min: 0,
      required: true,
      default: 2000,
    },
    installationCharges: {
      type: Number,
      default: 0,
      required: true,
    },
    packagingCharges: {
      type: Number,
      default: 0,
      required: true,
    },
    packagingTaxPercentage: {
      type: Number,
      default: 18,
      required: true,
      validate: {
        validator: (value) => [12, 18].includes(value),
        message: "Invalid packaging tax percentage. Allowed values: 12, 18.",
      },
    },
    transportationCharges: {
      type: Number,
      default: 0,
    },
    paid: {
      type: Boolean,
      default: false,
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
