const jwt = require("jsonwebtoken");

const authMiddleware = (req, res, next) => {
  // Get token from the headers
  const authHeader = req.header("Authorization");
  
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).json({ message: "No token, authorization denied" });
  }

  const token = authHeader.split(" ")[1];

  try {
    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET || "supersecretkey123");
    req.user = decoded; // Add user info to the request object (req.user.id)
    next(); // Move to the next function (the controller)
  } catch (err) {
    res.status(401).json({ message: "Token is not valid" });
  }
};

module.exports = authMiddleware;