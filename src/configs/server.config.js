import express from "express";
import env from "#configs/env";
import routeMapper from "#routes/index";
import globalErrorHandler from "#utils/error";
const app = express();
app.use(express.json());
app.use("/", routeMapper);
app.use(globalErrorHandler);
export default app;
