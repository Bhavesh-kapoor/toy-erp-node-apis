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
  amount: {
    min: 0,
    type: Number,
    required: true,
  },
  balancedAmount: {
    min: 0,
    type: Number,
  },
  paymentType: {
    type: String,
    enum: Object.values(PaymentType),
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
  paymentMethod: {
    type: String,
    enum: Object.values(PaymentMethod),
    required: true,
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
