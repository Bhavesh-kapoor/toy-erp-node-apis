import mongoose from "mongoose";
import User from "#models/user";
import BaseSchema from "#models/base";

export const ledgerEnumArr = ["Customer", "Supplier", "Cash", "Bank", "Both"];

const partySchema = new BaseSchema({
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
    type: String,
  },
  billingAddress2: {
    type: String,
  },
  pinCode: {
    type: String,
  },
  country: {
    type: String,
    required: true,
    default: "India",
  },
  state: {
    type: String,
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
  yobAmount: { type: Number }, // YOB(Amount)
  cbAmount: { type: Number }, // CB(Amount)
  eYobAmount: { type: Number }, // E-YOB(Amt.)
  eCbAmount: { type: Number }, // E-CB(Amt.)
  creditDays: { type: Number }, // Credit Days
  creditLimit: { type: Number }, // Credit Limit

  addtionalMobileNumbers: [{ type: String }],
  additionalEmails: [{ type: String }],
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

  accountNo: { type: String }, // Account No.
  bankName: { type: String }, // Bank Name
  branchAddress: { type: String }, // Branch Address
  ifscCode: { type: String }, // IFSC Code
  swiftCode: { type: String }, // Swift Code
});

export default mongoose.model("Party", partySchema);
