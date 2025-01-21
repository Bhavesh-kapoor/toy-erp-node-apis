import BaseSchema from "#models/base";
import Warehouse from "#models/warehouse";
import mongoose from "mongoose";

const itemTransferSchema = new BaseSchema(
  {
    issueNumber: {
      type: String,
      unique: true,
      sparse: true,
    },
    issueDate: {
      type: Date,
      required: true,
      default: Date.now,
    },
    issueTo: {
      type: mongoose.Schema.Types.ObjectId,
      ref: Warehouse,
      required: true,
    },
    issueFrom: {
      type: mongoose.Schema.Types.ObjectId,
      ref: Warehouse,
      required: true,
    },
    referenceNo: {
      type: String,
      default: "",
    },
    remarks: {
      type: String,
      default: "",
    },
    stock: {
      type: Map,
      of: {
        type: Number,
        min: 1,
      },
    },
    totalQuantity: {
      type: Number,
      default: 0,
    },
    totalValue: {
      type: Number,
      default: 0,
    },
    netAmount: {
      type: Number,
      default: function () {
        return this.totalValue + this.otherCharges;
      },
    },
  },
  { timestamps: true },
);

itemTransferSchema.pre("save", async function (next) {
  if (this.issueNumber) return next();
  const timestamp = Math.floor(Date.now() / 10);
  this.issueNumber = `IT-NO-${timestamp}`;
  next();
});

const ItemTransfer = mongoose.model("ItemTransfer", itemTransferSchema);
export default ItemTransfer;
