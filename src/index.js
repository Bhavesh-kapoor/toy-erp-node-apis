import env from "#configs/env";
import app from "#configs/server";
import connectDB from "#configs/database";
import { logger } from "./configs/logger.js";

await connectDB(env.DB_URI);

app.listen(env.PORT, () => {
  logger.info(`Server is running at http://localhost:${env.PORT}`.blue);
});
