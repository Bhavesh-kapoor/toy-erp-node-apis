import env from "#configs/env";
import logger from "#configs/logger";
import server from "#configs/server";
import connectDB from "#configs/database";
import { defaultOperations } from "#libs/default";

await connectDB(env.DB_URI);
await defaultOperations();

server.listen(env.PORT, () => {
  logger.info(`Server is running at http://localhost:${env.PORT}`.blue);
});
