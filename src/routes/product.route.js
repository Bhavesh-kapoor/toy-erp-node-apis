import express from "express";
import {
  get,
  create,
  update,
  deleteData,
  getBaseFields,
  getLimitedFields,
  searchProduct,
  getProductStock,
} from "#controllers/product";

const router = express.Router();

router.route("/base-fields").get(getBaseFields);
router.route("/public").get(getLimitedFields);
router.route("/search").get(searchProduct);
router.route("/get-stock/:id").get(getProductStock);
router.route("/:id?").get(get).post(create).put(update).delete(deleteData);
export default router;
