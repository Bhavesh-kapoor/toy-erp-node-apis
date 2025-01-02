import mongoose from "mongoose";
import User from "#models/user";

export const ledgerEnumArr = ["Customer", "Supplier", "Cash", "Bank", "Both"];

const companySchema = new mongoose.Schema(
  {
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
    companyInformation: {
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
    },

    contactDetails: {
      mobile: { type: String },
      email: { type: String },
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
    },

    bankDetails: {
      accountNo: { type: String }, // Account No.
      bankName: { type: String }, // Bank Name
      branchAddress: { type: String }, // Branch Address
      ifscCode: { type: String }, // IFSC Code
      swiftCode: { type: String }, // Swift Code
    },
  },
  { timestamps: true },
);

export default mongoose.model("Company", companySchema);
