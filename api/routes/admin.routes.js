// backend/routes/admin.routes.js
const router = require("express").Router();
const adminController = require("../controllers/admin.controller");
const { protect, authorize } = require("../middleware/auth.middleware");
const { uploadSingle } = require("../middleware/upload.middleware");

// All admin routes require authentication and admin role
router.use(protect);
router.use(authorize("admin"));

// Dashboard
router.get("/dashboard/stats", adminController.getDashboardStats);

// Users management
router.get("/users", adminController.getUsers);
router.post("/users", adminController.createUser);
router.put("/users/:id", adminController.updateUser);
router.delete("/users/:id", adminController.deleteUser);

// Vehicle image upload
router.post(
  "/upload-vehicle-image",
  uploadSingle,
  adminController.uploadVehicleImage
);

// Vehicle management
router.get("/vehicles", adminController.getVehicles);
router.get("/vehicles/pending", adminController.getPendingVehicles);
router.post("/vehicles", adminController.createVehicle);
router.put("/vehicles/:id", adminController.updateVehicle);
router.delete("/vehicles/:id", adminController.deleteVehicle);

// Bookings management
router.get("/bookings", adminController.getAllBookings);
router.get("/bookings/pending", adminController.getPendingBookings);
router.patch("/bookings/:bookingId/approve", adminController.approveBooking);
router.patch("/bookings/:bookingId/reject", adminController.rejectBooking);

// Vehicle verification
router.patch("/vehicles/:id/verify", adminController.verifyVehicle);

// Analytics
router.get("/analytics", adminController.getAnalytics);

// System settings
router.get("/settings", adminController.getSystemSettings);

module.exports = router;
