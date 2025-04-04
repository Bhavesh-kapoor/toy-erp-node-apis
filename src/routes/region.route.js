import express from "express";
import City from "#models/city";
import State from "#models/state";

const router = express.Router();

router.route("/state").get(async function (req, res, next) {
  try {
    const states = await State.find();
    res.status(200).json(states);
  } catch (err) {
    next(err);
  }
});

router.route("/city/:id").get(async function (req, res, next) {
  try {
    const { id } = req.params;
    if (!id) {
      throw {
        status: false,
        message: "State Id is required",
        httpStatus: 400,
      };
    }
    const cities = await City.find({ stateId: id });
    res.status(200).json(cities);
  } catch (err) {
    next(err);
  }
});

export default router;
