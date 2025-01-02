import mongoose from "mongoose";

export const instructionTypeEnumArr = ["Order", "Proforma", "Sampling"];

const instructionSchema = new mongoose.Schema(
  {
    instructionType: {
      type: String,
      enum: instructionTypeEnumArr,
      required: true,
    },
    shortDescription: {
      type: String,
      required: true,
    },
    longDescription: {
      type: String,
      required: true,
    },
  },
  { timestamps: true },
);

export default mongoose.model("Instruction", instructionSchema);
