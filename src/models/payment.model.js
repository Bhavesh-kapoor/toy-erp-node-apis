import mongoose from "mongoose";
import Ledger from "#models/ledger";
import BaseSchema from "#models/base";
import Invoice from "#models/invoice";
import Purchase from "#models/purchase";
import Quotation from "#models/quotation";
import AutoIncrementFactory from "mongoose-sequence";

// Initialize AutoIncrement
const AutoIncrement = AutoIncrementFactory(mongoose);

const PaymentStatus = {
  FAILED: "Failed",
  PENDING: "Pending",
  COMPLETED: "Completed",
};

const PaymentMethod = {
  CASH: "Cash",
  DEBIT_CARD: "Debit Card",
  CREDIT_CARD: "Credit Card",
  BANK_TRANSFER: "Bank Transfer",
  ONLINE_PAYMENT: "Online Payment",
};

const PaymentType = {
  PURCHASE_RETURN: "Purchase Return",
  PURCHASE: "Purchase",
  INVOICE: "Invoice",
  INVOICE_RETURN: "Invoice_Return",
};

const paymentSchema = new BaseSchema({
  paymentNo: {
    type: Number,
    unique: true,
  },
  paymentType: {
    type: String,
    enum: Object.values(PaymentType),
    required: true,
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
  paymentMethod: {
    type: String,
    enum: Object.values(PaymentMethod),
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
    trim: true,
  },
  document: {
    type: String,
    file: true,
  },
});

paymentSchema.plugin(AutoIncrement, {
  inc_field: "paymentNo",
  start_seq: 1000,
});

const Payment = mongoose.model("Payment", paymentSchema);

export default Payment;
