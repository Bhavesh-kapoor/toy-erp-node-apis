import mongoose from "mongoose";
import BaseSchema from "#models/base";
import User, { addressSchema } from "#models/user";

let leadCount = 0;

const leadSchema = new BaseSchema({
  leadId: {
    type: String,
  },
  billingAddress1: {
    type: addressSchema,
  },
  billingAddress2: {
    type: addressSchema,
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
  },
  email: {
    type: String,
    required: true,
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
  leadCount += 1;
  doc.leadId = `L-NO-${leadCount + 1000}`;
  await doc.save();
  next();
});

const Lead = mongoose.model("Lead", leadSchema);

Lead.countDocuments().then((count) => {
  leadCount = count;
});

export default Lead;
