import mongoose from "mongoose";
import BaseSchema from "#models/base";
import User, { addressSchema } from "#models/user";
import uploadFile from "#utils/uploadFile";
import AutoIncrementFactory from "mongoose-sequence";

// Initialize AutoIncrement
const AutoIncrement = AutoIncrementFactory(mongoose);

const leadSchema = new BaseSchema({
  leadId: {
    type: Number,
    unique: true,
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

leadSchema.plugin(AutoIncrement, {
  inc_field: "leadId",
  start_seq: 1000,
});

const Lead = mongoose.model("Lead", leadSchema);

export default Lead;
