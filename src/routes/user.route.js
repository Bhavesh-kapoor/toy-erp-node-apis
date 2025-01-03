import express from "express";
import { authentication } from "#middlewares/auth";
import {
  get,
  create,
  update,
  login,
  deleteData,
  getCurrentUser,
  enabletwoFactorAuth,
} from "#controllers/user";

const router = express.Router();

router.route("/login").post(login);
router.route("/get-current-user").get(authentication, getCurrentUser);
router.route("/enable2fa/:id").post(authentication, enabletwoFactorAuth);
router.route("/:id?").get(get).post(create).put(update).delete(deleteData);

export default router;
