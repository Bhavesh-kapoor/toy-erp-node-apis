import express from "express";
import { get, create, update, deleteData } from "#controllers/transaction";

const router = express.Router();

router.route("/:id?").get(get).post(create).put(update).delete(deleteData);
export default router;
