export default function queryHandler(req, res, next) {
  const params = req.query;
  for (const filter in params) {
    if (params[filter].includes(",")) {
      params[filter] = params[filter].split(",");
      params[filter] =
        params[filter].length > 1 ? params[filter] : params[filter][0];
    }
  }
  next();
}
