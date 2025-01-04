import mongoose from "mongoose";
import BaseSchema from "#models/base";

const addressSchema = new BaseSchema({
  belongsTo: {
    type: String,
    required: true,
    enum: ["User", "Lead"],
  },
  recipient: {
    type: mongoose.Schema.Types.ObjectId,
    refPath: "belongsTo",
    required: true,
  },
  line1: {
    type: String,
    required: true,
    trim: true,
  },
  street: {
    type: String,
    required: true,
    trim: true,
  },
  city: {
    type: String,
    required: true,
    trim: true,
  },
  state: {
    type: String,
    required: true,
    trim: true,
  },
  pinCode: {
    type: String,
    required: true,
    trim: true,
    validate: {
      validator: (value) => /^\d{6}$/.test(value), // Matches a 6-digit PIN code
      message: "Please enter a valid 6-digit PIN code.",
    },
  },
  country: {
    type: String,
    required: true,
    trim: true,
  },
  landmark: {
    type: String,
    trim: true,
  },
  isActive: {
    type: Boolean,
    default: true,
    required: true,
  },
  longitude: {
    type: Number,
    required: true,
  },
  latitude: {
    type: Number,
    required: true,
  },
});

export default mongoose.model("Address", addressSchema);
