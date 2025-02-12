import User from "#models/user";
import mongoose from "mongoose";
import Lead from "#models/lead";
import Ledger from "#models/ledger";
import Product from "#models/product";
import BaseSchema from "#models/base";
import Invoice from "#models/invoice";
import AutoIncrementFactory from "mongoose-sequence";

const AutoIncrement = AutoIncrementFactory(mongoose);

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
    taxableAmount: {
      type: Number,
      min: 0,
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
    type: Number,
    unique: true,
  },
  quotationDate: {
    type: Date,
    required: true,
    default: new Date(),
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
  paid: {
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
  gstAmount: {
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
  packingId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Packing",
  },
  mailed: {
    type: Boolean,
    default: false,
    required: true,
  },
});

quotationSchema.plugin(AutoIncrement, {
  inc_field: "quotationNo",
  start_seq: 1000,
});

const Quotation = mongoose.model("Quotation", quotationSchema);

export default Quotation;
