import express from "express";
import env from "#configs/env";
import routeMapper from "#routes/index";
const app  =  express();

app.use("/",routeMapper)

export default app;