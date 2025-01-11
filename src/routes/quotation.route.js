import express from "express";

import {
  get,
  create,
  update,
  deleteData,
  updateStatus,
} from "#controllers/quotation";

const router = express.Router();

router.route("/update-status/:id").put(updateStatus);
router.route("/:id?").get(get).post(create).put(update).delete(deleteData);
export default router;
