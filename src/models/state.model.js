import mongoose from "mongoose";
import BaseSchema from "#models/base";

const stateSchema = new BaseSchema({
  name: {
    type: String,
    required: true,
  },
});

export default mongoose.model("State", stateSchema);
