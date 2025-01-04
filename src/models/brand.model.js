import Role from "#models/role";
import mongoose, { Schema } from "mongoose";
import slugify from "slugify";
import BaseSchema from "#models/base";

const brandSchema = new BaseSchema(
  {
    name: {
      type: String,
      unique: true,
      required: [true, "Brand name is required"],
      minlength: [3, "Brand name must be at least 3 characters long"],
      maxlength: [100, "Brand name must be less than 100 characters"],
    },
    description: {
      type: String,
      required: [true, "Description is required"],
      minlength: [10, "Description must be at least 10 characters long"],
      maxlength: [500, "Description must be less than 500 characters"],
    },
    slug: {
      type: String,
      unique: true,
      lowercase: true,
      required: true,
    },
    deletedAt: {
      type: Date,
      default: null,
    },
  },
  { timestamps: true, versionKey: "version" },
);

brandSchema.pre("save", function (next) {
  // Generate a slug from the name field if it's not set
  if (this.isModified("name")) {
    this.slug = slugify(this.name, { lower: true, strict: true });
  }
  next();
});

// Static method to retrieve only active (non-deleted) brands
brandSchema.statics.active = function () {
  return this.find({ deletedAt: null });
};

// Instance method to mark a brand as deleted (soft delete)
brandSchema.methods.softDelete = function () {
  this.deletedAt = new Date();
  return this.save();
};

const Brand = mongoose.model("Brand", brandSchema);

export default Brand;
