import "colors";
import figlet from "figlet";
import mongoose from "mongoose";
import { logger } from "./logger.js";

const connectDB = async (DB_URI) => {
  try {
    await mongoose.connect(DB_URI);
    figlet("DB Connected!", (err, data) => {
      if (err) {
        logger.error("Something went wrong with figlet...");
        return;
      }
      logger.info(`\n${data.yellow}`);
    });
  } catch (err) {
    logger.error(`Database connection failed: ${err.message}`);
    process.exit(1); // Exit the process with failure
  }
};

export default connectDB;
