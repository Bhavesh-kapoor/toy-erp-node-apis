import mongoose from "mongoose";
import BaseSchema from "#models/base";

const addressSchema = new BaseSchema({
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
