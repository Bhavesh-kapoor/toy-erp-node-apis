import { Router } from "express";
import {
  get,
  getBillingData,
  getExpenseData,
  getLedgerData,
  getQuotationData,
} from "#controllers/dashboard";

const router = Router();

router.route("/").get(get);
router.route("/get-ledgers").get(getLedgerData);
router.route("/get-expenses").get(getExpenseData);
router.route("/get-billings").get(getBillingData);
router.route("/get-quotations").get(getQuotationData);

export default router;
