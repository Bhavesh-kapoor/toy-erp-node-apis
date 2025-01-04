import mongoose from "mongoose";
import BaseSchema from "#models/base";

const currencySchema = new BaseSchema({
  name: {
    type: String,
    required: true,
  },
  symbol: {
    type: String,
    required: true,
  },
  remarks: {
    type: String,
  },
});

export default mongoose.model("Currency", currencySchema);
