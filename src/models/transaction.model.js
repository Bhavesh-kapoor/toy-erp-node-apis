import mongoose from "mongoose";
import Ledger from "#models/ledger";
import BaseSchema, { counter } from "#models/base";

const PaymentType = {
  LEDGER_PAYMENT: "Ledger Payment",
  EMPLOYEE_EXPENSE: "Employee Expense",
};

const PaymentStatus = {
  FAILED: "Failed",
  PENDING: "Pending",
  COMPLETED: "Completed",
};

const PaymentDirection = {
  PAID: "Paid",
  RECEIVED: "Received",
};

const PaymentMethod = {
  CASH: "Cash",
  DEBIT_CARD: "Debit Card",
  CREDIT_CARD: "Credit Card",
  BANK_TRANSFER: "Bank Transfer",
  ONLINE_PAYMENT: "Online Payment",
};

const transactionSchema = new BaseSchema({
  transactionNo: {
    type: String,
    unique: true,
  },
  transactionDate: {
    type: Date,
    required: true,
    default: new Date(),
  },
  ledgerId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: Ledger,
    required: function () {
      return this.paymentType === PaymentType.LEDGER_PAYMENT;
    },
  },
  amount: {
    min: 1,
    type: Number,
    required: true,
  },
  deduction: {
    min: 0,
    type: Number,
  },
  tdsAmount: {
    type: Number,
    min: 0,
  },
  netAmount: {
    type: Number,
    min: 1,
  },
  paymentType: {
    type: String,
    enum: Object.values(PaymentType),
    required: true,
  },
  paymentMethod: {
    type: String,
    enum: Object.values(PaymentMethod),
    required: true,
  },
  paymentDirection: {
    type: String,
    enum: Object.values(PaymentDirection),
    required: true,
  },
  paymentStatus: {
    type: String,
    enum: Object.values(PaymentStatus),
    default: PaymentStatus.PENDING,
    required: true,
  },
  employee: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: function () {
      return this.paymentType === PaymentType.EMPLOYEE_EXPENSE;
    },
  },
  remarks: {
    type: String,
    required: true,
    trim: true,
  },
});

transactionSchema.post("save", async function (doc, next) {
  if (doc.transactionNo) return next();
  const countData = await counter;
  countData.transaction += 1;
  doc.transactionNo = `T-NO-${countData.transaction + 1100}`;
  await countData.save();
  await doc.save();
  next();
});

const Transaction = mongoose.model("Transaction", transactionSchema);

export default Transaction;
