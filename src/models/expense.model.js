import mongoose from "mongoose";
import User from "#models/user";
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

export default mongoose.model("Expense", expenseSchema);
