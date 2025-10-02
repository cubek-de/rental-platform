// backend/server.js
const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const helmet = require("helmet");
const morgan = require("morgan");
const compression = require("compression");
const rateLimit = require("express-rate-limit");
const mongoSanitize = require("express-mongo-sanitize");
// const xss = require("xss-clean");
const hpp = require("hpp");
const path = require("path");
const fs = require("fs");

// Load environment variables manually without dotenv logging
try {
  const envPath = path.join(__dirname, ".env");
  if (fs.existsSync(envPath)) {
    const envContent = fs.readFileSync(envPath, "utf8");
    const envLines = envContent.split("\n");

    envLines.forEach((line) => {
      const trimmedLine = line.trim();
      if (trimmedLine && !trimmedLine.startsWith("#")) {
        const [key, ...valueParts] = trimmedLine.split("=");
        if (key && valueParts.length > 0) {
          const value = valueParts.join("=").replace(/^["']|["']$/g, "");
          process.env[key] = value;
        }
      }
    });
  }
} catch (error) {
  console.error("Error loading .env file:", error.message);
}

// Suppress Mongoose warnings
mongoose.set("debug", false);
mongoose.set("strictQuery", false);

// Disable duplicate index warnings
mongoose.set("autoIndex", false);

// Suppress MongoDB driver warnings
process.env.MONGODB_DISABLE_DEPRECATED_OPTIONS = "true";

const app = express();

// Trust proxy
app.set("trust proxy", 1);

// Security Middleware
app.use(
  helmet({
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'"],
        styleSrc: ["'self'", "'unsafe-inline'", "https://fonts.googleapis.com"],
        scriptSrc: [
          "'self'",
          "'unsafe-inline'",
          "'unsafe-eval'",
          "https://js.stripe.com",
        ],
        imgSrc: ["'self'", "data:", "https:", "http:"],
        fontSrc: ["'self'", "https://fonts.gstatic.com"],
        frameSrc: ["'self'", "https://js.stripe.com"],
        connectSrc: ["'self'", "https://api.stripe.com"],
      },
    },
    crossOriginEmbedderPolicy: false,
  })
);

// CORS configuration
const corsOptions = {
  origin: function (origin, callback) {
    const allowedOrigins = [
      process.env.FRONTEND_URL,
      "http://localhost:5173",
      "http://localhost:3001",
    ];
    if (!origin || allowedOrigins.indexOf(origin) !== -1) {
      callback(null, true);
    } else {
      callback(new Error("Not allowed by CORS"));
    }
  },
  credentials: true,
  methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
  allowedHeaders: [
    "Content-Type",
    "Authorization",
    "X-Requested-With",
    "X-Auth-Token",
  ],
  exposedHeaders: ["X-Auth-Token"],
  maxAge: 86400, // 24 hours
};

app.use(cors(corsOptions));

// Rate limiting configurations
const generalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100,
  message:
    "Zu viele Anfragen von dieser IP, bitte versuchen Sie es später erneut.",
  standardHeaders: true,
  legacyHeaders: false,
});

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 50, // Increased from 5 to 50 for testing
  message:
    "Zu viele Anmeldeversuche, bitte versuchen Sie es in 15 Minuten erneut.",
  skipSuccessfulRequests: true,
});

const paymentLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10,
  message: "Zu viele Zahlungsversuche, bitte warten Sie.",
});

// Apply rate limiting
app.use("/api", generalLimiter);
app.use("/api/auth/login", authLimiter);
app.use("/api/auth/register", authLimiter);
app.use("/api/payments", paymentLimiter);

// Body parsing middleware
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true, limit: "10mb" }));

// Data sanitization
// Temporarily disabled mongoSanitize due to Express 5.x compatibility issues
// app.use(mongoSanitize({
//   replaceWith: '_',
//   allowDots: true
// }));

// Custom MongoDB sanitization middleware
// app.use((req, res, next) => {
//   const sanitizeObject = (obj) => {
//     if (obj && typeof obj === 'object') {
//       for (const key in obj) {
//         if (obj.hasOwnProperty(key)) {
//           if (typeof obj[key] === 'string' && (obj[key].includes('$') || obj[key].includes('.'))) {
//             // Remove or replace potentially dangerous MongoDB operators
//             obj[key] = obj[key].replace(/\$/g, '').replace(/\./g, '');
//           } else if (typeof obj[key] === 'object') {
//             sanitizeObject(obj[key]);
//           }
//         }
//       }
//     }
//   };

//   if (req.body) sanitizeObject(req.body);
//   if (req.query) sanitizeObject(req.query);
//   if (req.params) sanitizeObject(req.params);

//   next();
// });

app.use(hpp());

// Custom XSS sanitization middleware
app.use((req, res, next) => {
  const sanitizeXSS = (obj) => {
    if (obj && typeof obj === "object") {
      for (const key in obj) {
        if (obj.hasOwnProperty(key)) {
          if (typeof obj[key] === "string") {
            // Basic XSS sanitization - remove dangerous HTML/script tags
            obj[key] = obj[key]
              .replace(
                /<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi,
                ""
              )
              .replace(/<[^>]*>/g, "")
              .replace(/javascript:/gi, "")
              .replace(/on\w+\s*=/gi, "");
          } else if (typeof obj[key] === "object") {
            sanitizeXSS(obj[key]);
          }
        }
      }
    }
  };

  if (req.body) sanitizeXSS(req.body);
  if (req.query) sanitizeXSS(req.query);
  if (req.params) sanitizeXSS(req.params);

  next();
});

app.use(hpp());

// Compression middleware
app.use(compression());

// Logging
if (process.env.NODE_ENV === "development") {
  app.use(morgan("dev"));
} else {
  app.use(morgan("combined"));
}

// Static files
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

// Database connection with retry logic
const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI, {
      serverSelectionTimeoutMS: 5000,
      socketTimeoutMS: 45000,
    });
    console.log("✅ MongoDB connected successfully");
  } catch (error) {
    console.error("❌ MongoDB connection error:", error);
    setTimeout(connectDB, 5000);
  }
};

connectDB();

// MongoDB connection events
mongoose.connection.on("disconnected", () => {
  console.warn("⚠️ MongoDB disconnected");
});

mongoose.connection.on("reconnected", () => {
  console.log("✅ MongoDB reconnected");
});

// Import Routes
const authRoutes = require("./routes/auth.routes");
// const userRoutes = require("./routes/user.routes");
const vehicleRoutes = require("./routes/vehicle.routes");
const bookingRoutes = require("./routes/booking.routes");
const paymentRoutes = require("./routes/payment.routes");
const adminRoutes = require("./routes/admin.routes");
const agentRoutes = require("./routes/agent.routes");
// const analyticsRoutes = require("./routes/analytics.routes");
// const reviewRoutes = require("./routes/review.routes");
// const uploadRoutes = require("./routes/upload.routes");

// API Routes
app.use("/api/auth", authRoutes);
// app.use("/api/users", userRoutes);
app.use("/api/vehicles", vehicleRoutes);
app.use("/api/bookings", bookingRoutes);
app.use("/api/payments", paymentRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/agent", agentRoutes);
// app.use("/api/analytics", analyticsRoutes);
// app.use("/api/reviews", reviewRoutes);
// app.use("/api/upload", uploadRoutes);

// Health check endpoint
app.get("/api/health", (req, res) => {
  res.json({
    status: "OK",
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    environment: process.env.NODE_ENV,
  });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: "Route nicht gefunden",
  });
});

// Global error handler
app.use((err, req, res, next) => {
  console.error("Error:", err);

  // Mongoose validation error
  if (err.name === "ValidationError") {
    const errors = Object.values(err.errors).map((e) => e.message);
    return res.status(400).json({
      success: false,
      message: "Validierungsfehler",
      errors,
    });
  }

  // Mongoose duplicate key error
  if (err.code === 11000) {
    const field = Object.keys(err.keyValue)[0];
    return res.status(400).json({
      success: false,
      message: `${field} existiert bereits`,
    });
  }

  // JWT errors
  if (err.name === "JsonWebTokenError") {
    return res.status(401).json({
      success: false,
      message: "Ungültiger Token",
    });
  }

  if (err.name === "TokenExpiredError") {
    return res.status(401).json({
      success: false,
      message: "Token abgelaufen",
    });
  }

  // Default error
  res.status(err.status || 500).json({
    success: false,
    message: err.message || "Interner Serverfehler",
    ...(process.env.NODE_ENV === "development" && { stack: err.stack }),
  });
});

// Graceful shutdown
process.on("SIGTERM", () => {
  console.log("SIGTERM signal received: closing HTTP server");
  server.close(() => {
    console.log("HTTP server closed");
    mongoose.connection.close(false, () => {
      console.log("MongoDB connection closed");
      process.exit(0);
    });
  });
});

const PORT = process.env.PORT || 5005;
const server = app.listen(PORT, () => {
  console.log(
    `🚀 Server running on port ${PORT} in ${process.env.NODE_ENV} mode`
  );
});

// Handle unhandled promise rejections
process.on("unhandledRejection", (err) => {
  console.error("Unhandled Promise Rejection:", err);
  server.close(() => {
    process.exit(1);
  });
});

module.exports = app;
