import mongoose, { Schema } from "mongoose";

export const addressSchema = new Schema({
  line1: {
    type: String,
    required: true,
    trim: true,
  },
  street: {
    type: String,
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
      validator: (value) => /^[1-9]\d{4,9}$/.test(value), // Matches a 10-digit PIN code
      message: "Please enter a valid PIN code.",
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
  longitude: {
    type: String,
  },
  latitude: {
    type: String,
  },
});

export default mongoose.model("Address", addressSchema);
