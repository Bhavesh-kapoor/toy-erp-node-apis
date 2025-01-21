import express from "express";
import {
  get,
  create,
  update,
  deleteData,
  updateStock,
  getBaseFields,
} from "#controllers/purchase";

const router = express.Router();

router.route("/public/base-fields").get(getBaseFields);
router.route("/update-status/:id").put(updateStock);
router.route("/:id?").get(get).post(create).put(update).delete(deleteData);
export default router;
