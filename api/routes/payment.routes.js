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
  "/create-payment-intent",
  body("bookingId").isMongoId().withMessage("Ungültige Buchungs-ID"),
  body("paymentOption")
    .isIn(["full", "split"])
    .withMessage("Ungültige Zahlungsoption (full oder split)"),
  paymentController.createPaymentIntent
);

router.post(
  "/confirm-payment",
  body("paymentIntentId")
    .notEmpty()
    .withMessage("Payment Intent ID erforderlich"),
  body("bookingId").isMongoId().withMessage("Ungültige Buchungs-ID"),
  paymentController.confirmPayment
);

router.get("/:bookingId", paymentController.getPaymentDetails);

// Admin/Agent routes
router.post(
  "/refund",
  authorize("admin"),
  body("bookingId").isMongoId().withMessage("Ungültige Buchungs-ID"),
  paymentController.processRefund
);

// Mark cash payment as received (for split payments)
router.post(
  "/:bookingId/cash-received",
  authorize("agent", "admin"),
  body("notes").optional().isString(),
  paymentController.markCashPaymentReceived
);

module.exports = router;
