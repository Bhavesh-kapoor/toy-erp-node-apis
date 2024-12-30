import express from "express";
import { get, create, update, deleteData, login } from "#controllers/user";

const router = express.Router();

router.post("/login", login);

router.route("/:id?").get(get).post(create).put(update).delete(deleteData);
export default router;
