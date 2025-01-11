import User from "#models/user";
import mongoose from "mongoose";
import Ledger from "#models/ledger";
import Product from "#models/product";
import BaseSchema from "#models/base";

let quotationCount = 0;
const quotationStatusArr = ["Approved", "Cancelled", "Pending"];

// Schema for individual line items
const itemSchema = new BaseSchema(
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
    },
    igst: {
      type: Number,
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
    stockInHand: {
      type: Number,
      min: 0,
    },
  },
  { timestamps: false, _id: false },
);

// Main schema for the quotation
const quotationSchema = new BaseSchema({
  quotationNo: {
    type: String,
    unique: true,
    trim: true,
  },
  quotationDate: {
    type: Date,
    required: true,
  },
  customer: {
    type: mongoose.Schema.Types.ObjectId,
    ref: Ledger,
    required: true,
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
    trim: true,
    ref: User,
  },
  isTaxed: {
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

  // Transport details
  transport: {
    type: Number,
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
  packing: {
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
  expectedDelivery: {
    type: String,
  },
});

quotationSchema.post("save", async function (doc, next) {
  if (doc.quotationNo) return next();
  quotationCount += 1;
  doc.quotationNo = `Q-NO-${quotationCount + 1000}`;
  next();
});

const Quotation = mongoose.model("Quotation", quotationSchema);

Quotation.countDocuments().then((count) => {
  quotationCount = count;
});

export default Quotation;
