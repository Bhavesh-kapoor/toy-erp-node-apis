import express from "express";
import {
  get,
  create,
  update,
  deleteData,
  getBaseFields,
  getTotalByLedgerId,
} from "#controllers/payment";

const router = express.Router();

router.route("/total/:id").get(getTotalByLedgerId)
router.route("/public/base-fields").get(getBaseFields);
router.route("/:id?").get(get).post(create).put(update).delete(deleteData);
export default router;
