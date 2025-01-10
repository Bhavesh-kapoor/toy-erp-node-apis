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

  jobWork: {
    type: String,
  },
  gstNo: {
    type: String,
  },
  panNo: {
    type: String,
  },
  yobAmount: {
    type: Number,
  }, // YOB(Amount)
  cbAmount: {
    type: Number,
  }, // CB(Amount)
  eYobAmount: {
    type: Number,
  }, // E-YOB(Amt.)
  eCbAmount: {
    type: Number,
  }, // E-CB(Amt.)
  creditDays: {
    type: Number,
  }, // Credit Days
  creditLimit: {
    type: Number,
  }, // Credit Limit

  addtionalMobileNumbers: {
    type: [String],
  },
  additionalEmails: {
    type: [String],
  },
  transport: {
    type: String,
  },
  privateMark: {
    type: String,
  },
  factor: {
    type: String,
  },
  debit: {
    type: String,
  },
  websiteUrl: {
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
  swiftCode: {
    type: String,
  },
});

export default mongoose.model("Ledger", ledgerSchema);
