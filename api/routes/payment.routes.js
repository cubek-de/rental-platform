// backend/routes/payment.routes.js
const express = require("express");
const router = express.Router();
const { body } = require("express-validator");
const paymentController = require("../controllers/payment.controller");
const { protect, authorize } = require("../middleware/auth.middleware");

// Webhook route (no auth required)
router.post(
  "/webhook/stripe",
  express.raw({ type: "application/json" }),
  paymentController.handleStripeWebhook
);

// Protected routes
router.use(protect);

router.post(
  "/create-intent",
  body("bookingId").isMongoId().withMessage("Ungültige Buchungs-ID"),
  paymentController.createPaymentIntent
);

router.post(
  "/confirm",
  body("paymentIntentId")
    .notEmpty()
    .withMessage("Payment Intent ID erforderlich"),
  body("bookingId").isMongoId().withMessage("Ungültige Buchungs-ID"),
  paymentController.confirmPayment
);

router.get("/:bookingId", paymentController.getPaymentDetails);

// Admin routes
router.post(
  "/refund",
  authorize("admin"),
  body("bookingId").isMongoId().withMessage("Ungültige Buchungs-ID"),
  paymentController.processRefund
);

module.exports = router;
