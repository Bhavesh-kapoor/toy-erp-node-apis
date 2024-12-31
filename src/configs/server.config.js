import express from "express";
import routeMapper from "#routes/index";
import globalErrorHandler from "#utils/error";
import queryHandler from "#middlewares/queryHandler";

const app = express();

app.use(express.json());
app.use(queryHandler);
app.use("/", routeMapper);
app.use(globalErrorHandler);

export default app;
