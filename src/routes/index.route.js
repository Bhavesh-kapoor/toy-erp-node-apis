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
      const normalizedPath = routePath.replace(/\\/g, "/"); // Normalize to forward slashes
      const route = (await import(normalizedPath)).default;
      let fileName = file.replace(".route.js", "");
      let endPoint = "";
      for (let s of fileName) {
        if (s.toLowerCase() !== s) {
          endPoint += "-";
        }
        endPoint += s.toLowerCase();
      }
      routeMapper.use(`/${endPoint}`, route);
    }
  }
};

await loadRoutes();

export default routeMapper;
