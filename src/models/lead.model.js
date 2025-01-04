import User from "#models/user";
import mongoose from "mongoose";
import BaseSchema from "#models/base";

let leadCount = 0;

const leadSchema = new BaseSchema(
  {
    addresses: [mongoose.Schema.Types.ObjectId],
    personalDetails: {
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
      },
    },
    companyDetails: {
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
      phone: {
        type: String,
      },
      companyAddress: {
        type: mongoose.Schema.Types.ObjectId,
      },
    },

    sourceName: {
      type: String,
      required: false,
    },
    status: {
      type: [String],
      enum: ["Pending", "Contacted", "Qualified", "Converted", "Closed"],
      default: ["Pending"],
    },
    priorityLevel: {
      type: String,
      enum: ["Low", "Medium", "High", "Urgent"],
      default: "Medium",
    },
    assignedSalesPerson: {
      type: mongoose.Schema.Types.ObjectId,
      ref: User,
      required: false,
    },
    assignedDate: {
      type: Date,
      required: false,
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
        required: false,
      },
      tags: {
        type: [String],
        required: false,
      },
    },
  },
  { timestamps: true },
);

leadSchema.post("save", async function (doc, next) {
  if (doc.leadId) return next();
  leadCount += 1;
  doc.leadId = `L-${leadCount + 1000}`;
  await doc.save();
  next();
});

const Lead = mongoose.model("Lead", leadSchema);

Lead.countDocuments().then((count) => {
  leadCount = count;
});
export default Lead;
