// backend/routes/agent.routes.js
const router = require("express").Router();
const agentController = require("../controllers/agent.controller");
const { protect, authorize } = require("../middleware/auth.middleware");
const { uploadSingle } = require("../middleware/upload.middleware");

// All agent routes require authentication and agent/admin role
router.use(protect);
router.use(authorize("agent", "admin"));

// Dashboard
router.get("/dashboard", agentController.getDashboard);

// Vehicles
router.get("/vehicles", agentController.getMyVehicles);

// Upload vehicle image (shared with admin)
router.post("/upload-vehicle-image", uploadSingle, agentController.uploadVehicleImage);

// Bookings
router.get("/bookings", agentController.getMyBookings);

// Analytics
router.get("/analytics", agentController.getAgentAnalytics);

module.exports = router;
