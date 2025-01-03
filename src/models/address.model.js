import mongoose from "mongoose";

const addressSchema = new mongoose.Schema({
  street: {
    type: String,
    required: false,
  },
  city: {
    type: String,
    required: false,
  },
  state: {
    type: String,
    required: false,
  },
  zipCode: {
    type: String,
    required: false,
  },
  country: {
    type: String,
    required: false,
  },
  selected: {
    type: Boolean,
  },
});

export default mongoose.model("Address", addressSchema);
