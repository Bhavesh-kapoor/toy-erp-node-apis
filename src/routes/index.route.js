import fs from "fs";
import express from "express";
import path, { join } from "path";

const routesDir = path.resolve("src/routes");

const routeMapper = express.Router();

const loadRoutes = async () => {
  const files = fs.readdirSync(routesDir);

  for (const file of files) {
    if (file.endsWith(".route.js") && file !== "index.route.js") {
      const routePath = join(routesDir, file);
      const route = (await import(routePath)).default;
      routeMapper.use(`/${file.replace(".route.js", "")}`, route);
    }
  }
};

await loadRoutes();

export default routeMapper;
