import mongoose from "mongoose";

const roleSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true,
  },
  permission: {
    type: mongoose.Schema.Types.Mixed,
  },
});
export default mongoose.model("Role", roleSchema);
