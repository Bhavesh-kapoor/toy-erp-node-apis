export default function queryHandler(req, res, next) {
  const query = req.query;
  for (const filter in query) {
    if (query[filter].includes(",")) {
      query[filter] = query[filter].split(",");
      query[filter] =
        query[filter].length > 1 ? query[filter] : query[filter][0];
    }
  }

  const {
    role,
    status,
    endDate,
    page = 1,
    startDate,
    searchkey,
    limit = 10,
    search = "",
    sortdir = "desc",
    sortkey = "createdAt",
  } = query;

  const pageNumber = parseInt(page);
  const limitNumber = parseInt(limit);

  const pipeline = [];
  const matchStage = {};

  if (role) matchStage.role = role;
  if (search && searchkey)
    matchStage[searchkey] = { $regex: search, $options: "i" };

  if (status) matchStage.status = status;

  if (startDate || endDate) {
    matchStage.createdAt = {};
    if (startDate) matchStage.createdAt.$gte = new Date(startDate);
    if (endDate) matchStage.createdAt.$lte = new Date(endDate);
  }

  if (Object.keys(matchStage).length > 0) pipeline.push({ $match: matchStage });

  const sortStage = {
    $sort: { [sortkey]: sortdir === "asc" ? 1 : -1 },
  };
  pipeline.push(sortStage);
  pipeline.push({ $skip: (pageNumber - 1) * limitNumber });
  pipeline.push({ $limit: limitNumber });

  const options = {
    collation: {
      locale: "en",
      strength: 2, // Case-insensitive collation
    },
  };

  const output = { pipeline, matchStage, options };
  next();
}
