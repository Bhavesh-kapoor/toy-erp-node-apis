import env from "#configs/env";
import server from "#configs/server";
import connectDB from "#configs/database";
import logger from "#configs/logger";

await connectDB(env.DB_URI);

server.listen(env.PORT, () => {
  logger.info(`Server is running at http://localhost:${env.PORT}`.blue);
});
