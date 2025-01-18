import mongoose from "mongoose";
import BaseSchema from "#models/base";

const PaymentType = {
  PERSONAL_EXPENSE: "Personal Expense",
  LEDGER_BALANCING: "Ledger Balancing",
  SUPPLIER_PAYMENT: "Supplier Payment",
  EMPLOYEE_PAYMENT: "Employee Payment",
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

const TransactionSchema = new BaseSchema({
  receiptNo: {
    type: String,
    required: true,
  },
  receiptDate: {
    type: Date,
    required: true,
  },
  ledgerId: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    ref: Ledger,
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
  },
  transactionDate: {
    type: Date,
    default: Date.now,
  },
  employee: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: function () {
      return this.paymentType === PaymentType.EMPLOYEE_PAYMENT;
    },
  },
  supplier: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Ledger",
    required: function () {
      return this.paymentType === PaymentType.SUPPLIER_PAYMENT;
    },
  },
  ledgerId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Ledger",
    required: function () {
      return this.paymentType === PaymentType.LEDGER_BALANCING;
    },
  },
  remarks: {
    type: String,
    trim: true,
  },
});

const Transaction = mongoose.model("Transaction", TransactionSchema);

export default Transaction;
