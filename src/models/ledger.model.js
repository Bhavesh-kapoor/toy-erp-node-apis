import mongoose from "mongoose";
import User, { addressSchema } from "#models/user";
import BaseSchema from "#models/base";

export const ledgerEnumArr = ["Customer", "Supplier", "Both"];

const ledgerSchema = new BaseSchema({
  companyName: {
    type: String,
    required: true,
  },
  contactPerson: {
    type: String,
    required: true,
  },
  ledgerType: {
    type: String,
    required: true,
    enum: ledgerEnumArr,
  },
  groupBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: User,
  },
  billingAddress1: {
    type: addressSchema,
  },
  billingAddress2: {
    type: addressSchema,
  },

  gstNo: {
    type: String,
  },
  panNo: {
    type: String,
  },
  creditDays: {
    type: Number,
  },
  creditLimit: {
    type: Number,
  },
  mobileNo: {
    type: String,
  },
  email: {
    type: String,
  },
  addtionalMobileNumber: {
    type: String,
  },
  additionalEmail: {
    type: String,
  },

  // Bank Details
  accountNo: {
    type: String,
  },
  bankName: {
    type: String,
  },
  branchAddress: {
    type: String,
  },
  ifscCode: {
    type: String,
  },
});

export default mongoose.model("Ledger", ledgerSchema);
