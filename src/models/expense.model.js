import mongoose from "mongoose";
import User from "#models/user";
import uploadFile from "#utils/uploadFile";
import BaseSchema from "#models/base";

const expenseSchema = new BaseSchema({
  userId: {
    type: BaseSchema.Types.ObjectId,
    required: true,
    ref: User,
  },
  amount: {
    type: Number,
    required: true,
    min: 1,
  },
  note: {
    type: String,
    required: true,
  },
  date: {
    type: Date,
    required: true,
  },
  document: {
    type: String,
    file: true,
  },
});

expenseSchema.pre("save", uploadFile);

export default mongoose.model("Expense", expenseSchema);
