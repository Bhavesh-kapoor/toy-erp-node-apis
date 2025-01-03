import multer from "multer";
import express from "express";
import routeMapper from "#routes/index";
import globalErrorHandler from "#utils/error";
import { authentication } from "#middlewares/auth";
import queryHandler from "#middlewares/queryHandler";
import sessionMiddleware from "#middlewares/session";

const app = express();

app.use(multer().any());
app.use(express.json());
app.use(queryHandler);
app.use(sessionMiddleware);
app.use("/api", routeMapper);
app.use(globalErrorHandler);

export default app;
