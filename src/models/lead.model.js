import mongoose, { Schema } from "mongoose";
import User from "#models/user";

let leadCount = 0;

const leadSchema = new Schema({
  leadId: {
    type: String,
    unique: true,
  },
  name: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    required: true,
    match: [/\S+@\S+\.\S+/, "Please provide a valid email address"],
  },
  salesPerson: {
    type: mongoose.Schema.Types.ObjectId,
    ref: User,
  },
  priorityLevel: {
    type: String,
    enum: ["Low", "Medium", "High"],
  },
  status: {
    type: String,
    enum: [
      "New",
      "Contacted",
      "Qualified",
      "Proposal Sent",
      "Closed Won",
      "Closed Lost",
    ],
    default: "New",
  },
  updateComments: {
    type: [
      {
        update: String,
        message: String,
      },
    ],
  },
  phone: {
    type: String,
    required: true,
  },
  companyName: {
    type: String,
    required: true,
  },
  source: {
    type: String,
    required: true,
    enum: ["Website", "Referral", "Event"],
  },
  address: {
    type: String,
  },
  jobTitle: {
    type: String,
  },
  notes: {
    type: String,
  },
});

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
