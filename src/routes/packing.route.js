import express from "express";
import {
  get,
  create,
  update,
  deleteData,
  getBaseFields,
  getLimitedFields,
} from "#controllers/packing";

const router = express.Router();

router.route("/public").get(getLimitedFields);
router.route("/public/base-fields").get(getBaseFields);
router.route("/:id?").get(get).post(create).put(update).delete(deleteData);
export default router;
