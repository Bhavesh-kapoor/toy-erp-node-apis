import express from "express";
import {
  get,
  create,
  update,
  login,
  deleteData,
  enabletwoFactorAuth,
} from "#controllers/user";

const router = express.Router();

router.route("/enable2fa/:id").post(enabletwoFactorAuth);
router.route("/login").post(login);

router.route("/:id?").get(get).post(create).put(update).delete(deleteData);

export default router;
