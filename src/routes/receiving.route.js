import express from "express";

const router = express.Router();

router.route("/").get().post().put().delete();

export default router;
