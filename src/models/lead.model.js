import mongoose, { Schema } from "mongoose";

const leadSchema = new Schema({
  name: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    required: true,
    match: [/\S+@\S+\.\S+/, "Please provide a valid email address"],
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
export default mongoose.model("Lead", leadSchema);
