import mongoose from "mongoose";
import BaseSchema from "#models/base";
import Counter from "#models/counter";
import User, { addressSchema } from "#models/user";
import uploadFile from "#utils/uploadFile";

const leadSchema = new BaseSchema({
  leadId: {
    type: String,
  },
  address: {
    type: addressSchema,
    required: false,
  },
  firstName: {
    type: String,
    required: true,
  },
  lastName: {
    type: String,
    required: true,
  },
  phone: {
    type: String,
    required: true,
    unique: true,
  },
  email: {
    type: String,
    required: true,
    unique: true,
  },
  gender: {
    type: String,
    enum: ["Male", "Female", "Other"],
  },
  companyName: {
    type: String,
  },
  companyPhoneNo: {
    type: String,
  },
  source: {
    type: String,
    default: "Manual",
    required: true,
  },
  priorityLevel: {
    type: String,
    enum: ["Low", "Medium", "High", "Urgent"],
    default: "Medium",
  },
  assignedSalesPerson: {
    type: mongoose.Schema.Types.ObjectId,
    ref: User,
  },
  followUp: {
    type: Date,
    required: true,
    default: new Date(),
  },
  leadType: {
    type: String,
    enum: ["Individual", "Company"],
  },
  converted: {
    type: Boolean,
    default: false,
    required: true,
  },
  description: {
    type: String,
  },
  document: {
    type: String,
    file: true,
  },
});

leadSchema.pre("save", uploadFile);

leadSchema.pre("save", async function (next) {
  if (this.leadId) return next();
  const timestamp = Math.floor(Date.now() / 10);
  this.leadId = `L-NO-${timestamp}`;
  next();
});

const Lead = mongoose.model("Lead", leadSchema);

export default Lead;
