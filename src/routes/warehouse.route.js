import express from "express";
import {
  get,
  create,
  update,
  deleteData,
  getStockByWarehouse,
} from "#controllers/warehouse";

const router = express.Router();

router.route("/public/:id").get(getStockByWarehouse);
router.route("/get-stock");
router.route("/:id?").get(get).post(create).put(update).delete(deleteData);
export default router;
