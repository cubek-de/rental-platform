// backend/routes/booking.routes.js
const router = require("express").Router();
const { body } = require("express-validator");
const bookingController = require("../controllers/booking.controller");
const { protect, authorize } = require("../middleware/auth.middleware");

// Validation
const bookingValidation = [
  body("vehicleId").isMongoId().withMessage("Ungültige Fahrzeug-ID"),
  body("startDate").isISO8601().withMessage("Ungültiges Startdatum"),
  body("endDate").isISO8601().withMessage("Ungültiges Enddatum"),
  body("guestInfo.adults")
    .isInt({ min: 1 })
    .withMessage("Mindestens 1 Erwachsener erforderlich"),
  body("driverInfo.licenseNumber")
    .notEmpty()
    .withMessage("Führerscheinnummer erforderlich"),
  body("paymentMethod")
    .isIn(["stripe", "paypal", "bank_transfer", "cash"])
    .withMessage("Ungültige Zahlungsmethode"),
];

// All routes require authentication
router.use(protect);

// User routes
router.post("/", bookingValidation, bookingController.createBooking);
router.get("/my-bookings", bookingController.getUserBookings);
router.get("/:id", bookingController.getBooking);

// Agent/Admin routes
router.patch(
  "/:id/status",
  authorize("agent", "admin"),
  bookingController.updateBookingStatus
);

router.post(
  "/:id/check-in",
  authorize("agent", "admin"),
  bookingController.processCheckIn
);

router.post(
  "/:id/check-out",
  authorize("agent", "admin"),
  bookingController.processCheckOut
);

module.exports = router;
