import multer from "multer";
import colors from "colors";
import express from "express";
import logger from "#configs/logger";
import routeMapper from "#routes/index";
import rateLimit from "express-rate-limit";
import globalErrorHandler from "#utils/error";
import { authentication } from "#middlewares/auth";
import queryHandler from "#middlewares/queryHandler";
import sessionMiddleware from "#middlewares/session";

const app = express();

app.use((req, res, next) => {
  const startTime = process.hrtime();
  res.on("finish", () => {
    const fetchStatus = () => {
      if (res.statusCode >= 500) return colors.red(`${res.statusCode}`);
      else if (res.statusCode >= 400) return colors.yellow(`${res.statusCode}`);
      else if (res.statusCode >= 300) return colors.cyan(`${res.statusCode}`);
      else if (res.statusCode >= 200) return colors.green(`${res.statusCode}`);
      else return colors.white(`${res.statusCode}`);
    };
    const diff = process.hrtime(startTime);
    const responseTime = (diff[0] * 1e3 + diff[1] * 1e-6).toFixed(2);
    logger.info(
      `${"METHOD:".blue} ${req.method.yellow} - ${"URL:".blue} ${
        req.originalUrl.yellow
      } - ${"STATUS:".blue} ${fetchStatus()} - ${"Response Time:".blue} ${
        responseTime.magenta
      } ${"ms".magenta}`,
    );
  });
  next();
});

const limiter = rateLimit({
  windowMs: 30 * 1000,
  max: 1000,
  message: "Too many requests from this IP, please try again later.",
});
app.use(limiter);

app.use(multer().any());
app.use(express.json());
app.use(queryHandler);
app.use(sessionMiddleware);
app.use("/api", routeMapper);
app.use(globalErrorHandler);

export default app;
