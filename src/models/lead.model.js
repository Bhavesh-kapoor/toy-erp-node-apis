import mongoose from "mongoose";
import BaseSchema, { counter } from "#models/base";
import User, { addressSchema } from "#models/user";

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
  dateOfBirth: {
    type: Date,
  },
  gender: {
    type: String,
    enum: ["Male", "Female", "Other"],
  },
  companyName: {
    type: String,
    required: true,
  },
  designation: {
    type: String,
  },
  industry: {
    type: String,
  },
  website: {
    type: String,
  },
  companyPhoneNo: {
    type: String,
  },
  companyAddress: {
    type: addressSchema,
    required: false,
  },
  source: {
    type: String,
  },
  status: {
    type: String,
    enum: ["Pending", "Contacted", "Qualified", "Converted", "Closed"],
    default: "Pending",
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
  statusUpdate: {
    type: [
      {
        update: String,
        message: String,
      },
    ],
  },
  metaData: {
    query: {
      type: String,
    },
    tags: {
      type: [String],
    },
  },
});

leadSchema.post("save", async function (doc, next) {
  if (doc.leadId) return next();
  const countData = await counter;
  countData.lead += 1;
  doc.leadId = `L-NO-${countData.lead + 1100}`;
  await doc.save();
  await countData.save();
  next();
});

const Lead = mongoose.model("Lead", leadSchema);

export default Lead;
