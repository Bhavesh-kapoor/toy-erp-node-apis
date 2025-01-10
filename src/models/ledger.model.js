import mongoose from "mongoose";
import User from "#models/user";
import BaseSchema from "#models/base";
import Address from "#models/address";

export const ledgerEnumArr = ["Customer", "Supplier", "Cash", "Bank", "Both"];

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
  //TODO: What this field will reference?
  groupBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: User,
  },
  billingAddress1: {
    type: mongoose.Schema.Types.ObjectId,
    ref: Address,
  },
  billingAddress2: {
    type: mongoose.Schema.Types.ObjectId,
    ref: Address,
  },

  gstNo: {
    type: String,
  },
  panNo: {
    type: String,
  },
  creditDays: {
    type: Number,
  }, // Credit Days
  creditLimit: {
    type: Number,
  }, // Credit Limit

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
