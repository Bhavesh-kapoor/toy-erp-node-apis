import mongoose from "mongoose";
import BaseSchema from "#models/base";

const departmentSchema = new BaseSchema({
  name: {
    type: String,
    required: true,
    trim: true,
  },
});
export default mongoose.model("Department", departmentSchema);
