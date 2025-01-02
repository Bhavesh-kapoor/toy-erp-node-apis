import mongoose from "mongoose";

const currencySchema = new mongoose.Schema(
  {
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
  },
  { timestamps: true },
);

export default mongoose.model("Currency", currencySchema);
