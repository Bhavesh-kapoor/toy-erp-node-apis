import mongoose from "mongoose";
import Counter from "#models/counter";

export async function setUpCounter() {
  let existingCounter = await Counter.findOne();
  if (!existingCounter) {
    existingCounter = await Counter.create({});
  }
  return existingCounter;
}
