import mongoose from "mongoose";
import Ledger from "#models/ledger";
import BaseSchema from "#models/base";
import Invoice from "#models/invoice";
import Quotation from "#models/quotation";
import AutoIncrementFactory from "mongoose-sequence";

// Initialize AutoIncrement
const AutoIncrement = AutoIncrementFactory(mongoose);

const RecevingStatus = {
  FAILED: "Failed",
  PENDING: "Pending",
  COMPLETED: "Completed",
};

const RecevingMethod = {
  CASH: "Cash",
  DEBIT_CARD: "Debit Card",
  CREDIT_CARD: "Credit Card",
  BANK_TRANSFER: "Bank Transfer",
  ONLINE_receiving: "Online Receving",
};

const RecevingType = {
  PURCHASE_RETURN: "Purchase Return",
  PURCHASE: "Purchase",
  INVOICE: "Invoice",
  INVOICE_RETURN: "Invoice_Return",
};

const receivingSchema = new BaseSchema({
  receivingNo: {
    type: Number,
    unique: true,
  },
  receivingType: {
    type: String,
    enum: Object.values(RecevingType),
    required: true,
  },
  receivingDate: {
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
  purchaseReturnId: {
    type: mongoose.Schema.Types.ObjectId,
  },
  amount: {
    min: 1,
    type: Number,
    required: true,
  },
  receivingMethod: {
    type: String,
    enum: Object.values(RecevingMethod),
    required: true,
  },
  receivingStatus: {
    type: String,
    enum: Object.values(RecevingStatus),
    default: RecevingStatus.PENDING,
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

receivingSchema.plugin(AutoIncrement, {
  inc_field: "receivingNo",
  start_seq: 1000,
});

const Receving = mongoose.model("Receving", receivingSchema);

export default Receving;
