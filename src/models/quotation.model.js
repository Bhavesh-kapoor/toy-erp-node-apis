import User from "#models/user";
import mongoose from "mongoose";
import Lead from "#models/lead";
import Ledger from "#models/ledger";
import Product from "#models/product";
import BaseSchema from "#models/base";
import Counter from "#models/counter";
import Invoice from "#models/invoice";

const quotationStatusArr = ["Approved", "Cancelled", "Pending"];

// Schema for individual line items
export const itemSchema = new BaseSchema(
  {
    product: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: Product,
      trim: true,
    },
    quantity: {
      type: Number,
      required: true,
      min: 1,
    },
    listPrice: {
      type: Number,
      required: true,
      min: 0,
    },
    value: {
      type: Number,
      required: true,
      min: 0,
    },
    discountPercentage: {
      type: Number,
      min: 0,
      max: 100,
    },
    discountAmount: {
      type: Number,
      min: 0,
    },
    cgst: {
      type: Number,
      min: 0,
    },
    sgst: {
      type: Number,
      min: 0,
    },
    igst: {
      type: Number,
      min: 0,
    },
    gstAmount: {
      type: Number,
      min: 0,
    },
    totalAmount: {
      type: Number,
      required: true,
      min: 0,
    },
    packedQuantity: {
      type: Number,
      min: 0,
      default: 0,
      validate: {
        validator: function (value) {
          return value <= this.quantity;
        },
        message: "Packed quantity ({VALUE}) cannot exceed total quantity.",
      },
    },
  },
  { timestamps: false, _id: false },
);

// Main schema for the quotation
const quotationSchema = new BaseSchema({
  quotationNo: {
    type: String,
    unique: true,
    sparse: true,
    trim: true,
  },
  quotationDate: {
    type: Date,
    required: true,
  },
  customer: {
    type: mongoose.Schema.Types.ObjectId,
    ref: Ledger,
  },
  lead: {
    type: mongoose.Schema.Types.ObjectId,
    ref: Lead,
  },
  poNo: {
    type: String,
    trim: true,
  },
  poDate: {
    type: Date,
  },
  remarks: {
    type: String,
    trim: true,
  },
  preparedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: User,
    required: true,
  },
  isTaxed: {
    type: Boolean,
    default: true,
  },
  delivered: {
    type: Boolean,
    default: false,
  },

  // Products
  products: {
    type: [itemSchema],
    default: [],
  },

  // Payment terms
  paymentTerms: {
    type: String,
    trim: true,
  },

  invoiceId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: Invoice,
  },

  // Transport details
  transport: {
    type: String,
    min: 1,
  },

  // Totals
  totalQuantity: {
    type: Number,
    min: 0,
    default: 0,
  },
  totalValue: {
    type: Number,
    min: 0,
    default: 0,
  },
  discountAmount: {
    type: Number,
    min: 0,
    default: 0,
  },
  additionalDiscountPercentage: {
    type: Number,
    min: 0,
    default: 0,
  },
  additionalDiscountAmount: {
    type: Number,
    min: 0,
    default: 0,
  },
  freightAmount: {
    type: Number,
    min: 0,
    default: 0,
  },
  taxableAmount: {
    type: Number,
    min: 0,
    default: 0,
  },
  cgstAmount: {
    type: Number,
    min: 0,
    default: 0,
  },
  sgstAmount: {
    type: Number,
    min: 0,
    default: 0,
  },
  igstAmount: {
    type: Number,
    min: 0,
    default: 0,
  },
  netAmount: {
    type: Number,
    min: 0,
    default: 0,
  },
  status: {
    type: String,
    enum: quotationStatusArr,
    required: true,
    default: "Pending",
  },
  latestData: {
    type: [itemSchema],
  },
});

quotationSchema.post("pre", async function (next) {
  if (this.quotationNo) return next();
  const timestamp = Math.floor(Date.now() / 10);
  this.quotationNo = `Q-NO-${timestamp}`;
  next();
});

const Quotation = mongoose.model("Quotation", quotationSchema);

export default Quotation;
