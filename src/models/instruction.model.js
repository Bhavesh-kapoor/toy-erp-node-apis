import mongoose from "mongoose";
import BaseSchema from "#models/base";

export const instructionTypeEnumArr = ["Order", "Proforma", "Sampling"];

const instructionSchema = new BaseSchema({
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
});

export default mongoose.model("Instruction", instructionSchema);
