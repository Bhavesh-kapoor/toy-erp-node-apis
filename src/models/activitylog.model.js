import mongoose from "mongoose";
import BaseSchema from "#/models/base";

const activityLogSchema = new BaseSchema(
  {
    leadId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Lead",
      index: true,
      required: true,
    },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      description: "User who performed the action.",
    },
    action: {
      type: String,
      required: true,
      enum: [
        // General Actions
        "LEAD_CREATED",
        "LEAD_UPDATED",
        "LEAD_DELETED",

        // Status Changes
        "STATUS_UPDATED",

        // Quotation and Invoice Actions
        "QUOTATION_CREATED",
        "QUOTATION_UPDATED",
        "QUOTATION_APPROVED",
        "INVOICE_CREATED",
        "INVOICE_UPDATED",

        // Warehouse, Packing, and Delivery
        "WAREHOUSE_UPDATED",
        "PACKING_STARTED",
        "PACKING_COMPLETED",
        "DELIVERY_SCHEDULED",
        "DELIVERY_UPDATED",
        "DELIVERY_COMPLETED",
        "DELIVERY_FAILED",

        // Notes and Comments
        "NOTE_ADDED",
        "COMMENT_ADDED",

        // Attachments
        "DOCUMENT_UPLOADED",
        "DOCUMENT_DELETED",

        // Custom Events
        "CUSTOM_EVENT",
      ],
    },
    description: {
      type: String,
      required: true,
      maxlength: 500,
      trim: true,
      description: "Brief summary of the action performed.",
    },
    metadata: {
      type: mongoose.Schema.Types.Mixed,
      description: "Additional contextual data for the action.",
    },
    createdAt: {
      type: Date,
      default: Date.now,
      description: "Timestamp when the action occurred.",
    },
  },
  {
    timestamps: true,
    versionKey: false,
  },
);

activityLogSchema.index({ leadId: 1, createdAt: -1 });

module.exports = mongoose.model("ActivityLog", activityLogSchema);
