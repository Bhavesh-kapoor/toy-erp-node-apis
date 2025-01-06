import mongoose from "mongoose";
import Party from "#models/party";
import Product from "#models/product";
import BaseSchema from "#models/base";

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
    discount: {
      percentage: {
        type: Number,
        min: 0,
        max: 100,
      },
      amount: {
        type: Number,
        min: 0,
      },
    },
    gst: {
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
    stockInHand: {
      type: Number,
      min: 0,
    },
  },
  { timestamps: false, id: false },
);

// Main schema for the quotation
const quotationSchema = new mongoose.Schema({
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
    ref: Party,
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
    type: String,
    trim: true,
  },
  tax: {
    type: Boolean,
    default: false,
  },

  // Line items
  lineItems: {
    type: [itemSchema],
    default: [],
  },

  // Payment terms
  paymentTerms: { type: String, trim: true },

  // Transport details
  transport: { type: Number, min: 1 },

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
  additionalDiscount: {
    percentage: {
      type: Number,
      min: 0,
      default: 0,
    },
    amount: {
      type: Number,
      min: 0,
      default: 0,
    },
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
});

export default mongoose.model("Quotation", quotationSchema);
