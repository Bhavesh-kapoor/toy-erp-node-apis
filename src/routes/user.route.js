import express from "express";
import { authentication } from "#middlewares/auth";
import {
  get,
  create,
  update,
  login,
  deleteData,
  forgotPass,
  resetPass,
  verifyPasswordResetOtp,
  getCurrentUser,
  enabletwoFactorAuth,
} from "#controllers/user";

const router = express.Router();

router.route("/login").post(login);
router.route("/forgot-pass").post(forgotPass);
router.route("/forgot-pass-otp-verify").post(verifyPasswordResetOtp);
router.route("/reset-pass").post(authentication, resetPass);
router.route("/get-current-user").get(authentication, getCurrentUser);
router.route("/enable2fa/:id").post(authentication, enabletwoFactorAuth);
router.route("/:id?").get(get).post(create).put(update).delete(deleteData);

export default router;
