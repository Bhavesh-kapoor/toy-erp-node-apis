import mongoose from "mongoose";
import Ledger from "#models/ledger";
import BaseSchema from "#models/base";
import Invoice from "#models/invoice";
import Purchase from "#models/purchase";
import Quotation from "#models/quotation";

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

const paymentSchema = new BaseSchema({
  paymentNo: {
    type: String,
    unique: true,
  },
  paymentDate: {
    type: Date,
    required: true,
    default: new Date(),
  },
  ledgerId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: Ledger,
  },
  quotationId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: Quotation,
  },
  invoiceId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: Invoice,
  },
  invoiceReturnId: {
    type: mongoose.Schema.Types.ObjectId,
  },
  purchaseReturnId: {
    type: mongoose.Schema.Types.ObjectId,
  },
  purchaseId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: Purchase,
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
  remarks: {
    type: String,
    required: true,
    trim: true,
  },
});

paymentSchema.pre("save", async function (next) {
  if (this.paymentNo) return next();
  const timestamp = Math.floor(Date.now() / 10);
  this.paymentNo = `T-NO-${timestamp}`;
  next();
});

const Payment = mongoose.model("Payment", paymentSchema);

export default Payment;
