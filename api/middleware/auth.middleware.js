// backend/middleware/auth.middleware.js
const jwt = require("jsonwebtoken");
const User = require("../models/User.model");

// Protect routes
const protect = async (req, res, next) => {
  try {
    let token;

    // Check for token in headers
    if (
      req.headers.authorization &&
      req.headers.authorization.startsWith("Bearer")
    ) {
      token = req.headers.authorization.split(" ")[1];
    }

    if (!token) {
      return res.status(401).json({
        success: false,
        message: "Nicht autorisiert - Kein Token",
      });
    }

    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Check if user still exists
    const user = await User.findById(decoded.id).select("-password");

    if (!user) {
      return res.status(401).json({
        success: false,
        message: "Der Benutzer existiert nicht mehr",
      });
    }

    // Check if user changed password after token was issued
    if (user.security.passwordChangedAt) {
      const passwordChangedTimestamp = parseInt(
        user.security.passwordChangedAt.getTime() / 1000,
        10
      );

      if (decoded.iat < passwordChangedTimestamp) {
        return res.status(401).json({
          success: false,
          message:
            "Passwort wurde kürzlich geändert. Bitte melden Sie sich erneut an",
        });
      }
    }

    // Check if user is active
    if (user.status !== "active") {
      return res.status(403).json({
        success: false,
        message: "Ihr Konto ist nicht aktiv",
      });
    }

    req.user = user;
    next();
  } catch (error) {
    if (error.name === "JsonWebTokenError") {
      return res.status(401).json({
        success: false,
        message: "Ungültiger Token",
      });
    }

    if (error.name === "TokenExpiredError") {
      return res.status(401).json({
        success: false,
        message: "Token abgelaufen",
      });
    }

    console.error("Auth middleware error:", error);
    res.status(500).json({
      success: false,
      message: "Authentifizierungsfehler",
    });
  }
};

// Authorize roles
const authorize = (...roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: "Nicht autorisiert",
      });
    }

    if (!roles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: "Sie haben keine Berechtigung für diese Aktion",
      });
    }

    next();
  };
};

// Check permissions
const checkPermission = (permission) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: "Nicht autorisiert",
      });
    }

    if (!req.user.permissions[permission]) {
      return res.status(403).json({
        success: false,
        message: "Unzureichende Berechtigungen",
      });
    }

    next();
  };
};

module.exports = { protect, authorize, checkPermission };
