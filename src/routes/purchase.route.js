import express from "express";
import {
  get,
  create,
  update,
  deleteData,
  getBaseFields,
} from "#controllers/purchase";

const router = express.Router();

router.route("/public/base-fields").get(getBaseFields);
router.route("/:id?").get(get).post(create).put(update).delete(deleteData);
export default router;
