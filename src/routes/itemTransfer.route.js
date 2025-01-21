import express from "express";

import {
  get,
  create,
  update,
  deleteData,
  updateStatus,
  getLimitedFields,
  getBaseFields,
} from "#controllers/itemTransfer";

const router = express.Router();

router.route("/public/base-fields").get(getBaseFields);
router.route("/:id?").get(get).post(create).put(update).delete(deleteData);
export default router;
