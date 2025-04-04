import mongoose from "mongoose";
import State from "#models/state";
import BaseSchema from "#models/base";

const citySchema = new BaseSchema({
  stateId: {
    type: mongoose.Types.ObjectId,
    required: true,
    ref: State,
  },
  name: {
    type: String,
    required: true,
  },
});

export default mongoose.model("City", citySchema);
