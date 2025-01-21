import BaseSchema from "#models/base";
import Warehouse from "#models/warehouse";
import mongoose from "mongoose";
import Counter from "#models/counter";

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

itemTransferSchema.post("save", async function (doc, next) {
  if (doc.issueNumber) return next();
  const countData = await Counter.findOne();
  countData.itemTransfer += 1;
  doc.issueNumber = `I-NO-${countData.itemTransfer + 2000}`;
  await doc.save();
  next();
});

const ItemTransfer = mongoose.model("ItemTransfer", itemTransferSchema);
export default ItemTransfer;
