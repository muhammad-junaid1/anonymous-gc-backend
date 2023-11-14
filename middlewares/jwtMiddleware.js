const jwt = require("jsonwebtoken");

module.exports = (req, res, next) => {
  const JWT_SECRET = process.env.JWT_SECRET;

  const { authorization } = req.headers;

  if (!authorization) {
    res.status(401).json({
      status: false,
      message: "Unauthorized",
    });
  }

  const token = authorization?.replace("Bearer ", "");
  jwt.verify(token, JWT_SECRET, (err, data) => {
    if (err) {
      res.status(403).json({
        status: false,
        message: "Invalid token",
      });
    } else {
      req.user = data?.id;
      next();
    }
  });
};
