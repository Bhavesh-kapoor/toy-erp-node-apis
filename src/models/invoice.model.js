import mongoose from "mongoose";
import BaseSchema from "#models/base";

const invoiceSchema = new BaseSchema(
  {
    billNumber: {
      type: String,
      required: true,
    },
    billDate: {
      type: Date,
      required: true,
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
    quotation: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Quotation",
      required: true,
    },
    parentInvoice: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Invoice",
    },
  },
  { timestamps: true },
);

invoiceSchema.pre("save", async function (next) {
  if (this.billNumber) return next();
  const timestamp = Math.floor(Date.now() / 1000); // Current UNIX timestamp
  this.billNumber = `INV-NO-${timestamp}`;
  next();
});

const Invoice = mongoose.model("Invoice", invoiceSchema);

export default Invoice;
