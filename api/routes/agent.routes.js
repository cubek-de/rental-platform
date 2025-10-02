// backend/routes/agent.routes.js
const router = require("express").Router();
const agentController = require("../controllers/agent.controller");
const { protect, authorize } = require("../middleware/auth.middleware");

// All agent routes require authentication and agent/admin role
router.use(protect);
router.use(authorize("agent", "admin"));

// Dashboard
router.get("/dashboard", agentController.getDashboard);

// Vehicles
router.get("/vehicles", agentController.getMyVehicles);

// Bookings
router.get("/bookings", agentController.getMyBookings);

// Analytics
router.get("/analytics", agentController.getAgentAnalytics);

module.exports = router;
