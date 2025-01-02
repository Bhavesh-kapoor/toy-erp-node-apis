import express from "express";
import routeMapper from "#routes/index";
import globalErrorHandler from "#utils/error";
import queryHandler from "#middlewares/queryHandler";
import sessionMiddleware from "#middlewares/session";

const app = express();

app.use(express.json());
app.use(queryHandler);
app.use(sessionMiddleware);
app.use("/", routeMapper);
app.use(globalErrorHandler);

export default app;
