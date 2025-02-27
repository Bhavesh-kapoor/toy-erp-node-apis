import express from "express";
import {
  get,
  create,
  update,
  deleteData,
  getBaseFields,
  getLimitedFields,
  updatePackedStatus,
  getMaxQuantity,
} from "#controllers/packing";

const router = express.Router();

router.route("/public").get(getLimitedFields);
router.route("/public/base-fields").get(getBaseFields);
router.route("/update-status/:id").put(updatePackedStatus);
router.route("/get-max-quantity").get(getMaxQuantity);
router.route("/:id?").get(get).post(create).put(update).delete(deleteData);
export default router;
