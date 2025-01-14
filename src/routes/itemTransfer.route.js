import express from "express";

import {
  get,
  create,
  update,
  deleteData,
  updateStatus,
  getLimitedFields,
} from "#controllers/itemTransfer";

const router = express.Router();

router.route("/:id?").get(get).post(create).put(update).delete(deleteData);
export default router;
