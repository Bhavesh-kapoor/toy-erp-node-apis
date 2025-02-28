import asyncHandler from "#utils/asyncHandler";
import objectParser from "#utils/objectParser";

const bodyParser = asyncHandler((req, _res, next) => {
  req.query = objectParser(req.query);
  for (const key in req.query) {
    if (typeof req.query[key] === "number")
      req.query[key] = req.query[key].toString();
  }
  if (req.method === "GET" || req.method === "DELETE") return next();
  if (
    !req.headers["content-type"] ||
    !req.headers?.["content-type"].includes("multipart")
  ) {
    return next();
  }

  req.body = objectParser(req.body);
  next();
});

export default bodyParser;
