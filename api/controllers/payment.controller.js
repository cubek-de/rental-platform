// backend/controllers/payment.controller.js
const stripe = require("stripe")(process.env.STRIPE_SECRET_KEY);
const Booking = require("../models/Booking.model");
const User = require("../models/User.model");
const sendEmail = require("../utils/sendEmail");

// Create payment intent
const createPaymentIntent = async (req, res) => {
  try {
    const { bookingId } = req.body;

    const booking = await Booking.findById(bookingId)
      .populate("vehicle")
      .populate("user");

    if (!booking) {
      return res.status(404).json({
        success: false,
        message: "Buchung nicht gefunden",
      });
    }

    // Check if user owns this booking
    if (booking.user._id.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: "Keine Berechtigung",
      });
    }

    // Create or get Stripe customer
    let stripeCustomerId = booking.user.stripeCustomerId;

    if (!stripeCustomerId) {
      const customer = await stripe.customers.create({
        email: booking.user.email,
        name: `${booking.user.firstName} ${booking.user.lastName}`,
        metadata: {
          userId: booking.user._id.toString(),
        },
      });

      stripeCustomerId = customer.id;

      // Save Stripe customer ID to user
      await User.findByIdAndUpdate(booking.user._id, {
        stripeCustomerId: customer.id,
      });
    }

    // Create payment intent
    const paymentIntent = await stripe.paymentIntents.create({
      amount: Math.round(booking.pricing.totalAmount * 100), // Convert to cents
      currency: "eur",
      customer: stripeCustomerId,
      metadata: {
        bookingId: booking._id.toString(),
        bookingNumber: booking.bookingNumber,
      },
      automatic_payment_methods: {
        enabled: true,
      },
      description: `Buchung ${booking.bookingNumber} - ${booking.vehicle.name}`,
    });

    // Update booking with payment intent ID
    booking.payment.stripeDetails.paymentIntentId = paymentIntent.id;
    await booking.save();

    res.json({
      success: true,
      data: {
        clientSecret: paymentIntent.client_secret,
        paymentIntentId: paymentIntent.id,
      },
    });
  } catch (error) {
    console.error("Create payment intent error:", error);
    res.status(500).json({
      success: false,
      message: "Fehler beim Erstellen der Zahlung",
    });
  }
};

// Confirm payment
const confirmPayment = async (req, res) => {
  try {
    const { paymentIntentId, bookingId } = req.body;

    const paymentIntent = await stripe.paymentIntents.retrieve(paymentIntentId);

    if (paymentIntent.status !== "succeeded") {
      return res.status(400).json({
        success: false,
        message: "Zahlung nicht erfolgreich",
      });
    }

    const booking = await Booking.findById(bookingId)
      .populate("vehicle")
      .populate("user");

    if (!booking) {
      return res.status(404).json({
        success: false,
        message: "Buchung nicht gefunden",
      });
    }

    // Update booking payment status
    booking.payment.status = "completed";
    booking.payment.stripeDetails.chargeId = paymentIntent.latest_charge;
    booking.payment.transactions.push({
      type: "payment",
      amount: paymentIntent.amount / 100,
      status: "completed",
      transactionId: paymentIntent.id,
      processedAt: new Date(),
    });
    booking.status = "confirmed";

    await booking.save();

    // Send confirmation email
    await sendPaymentConfirmationEmail(booking);

    // Update vehicle statistics
    await Vehicle.findByIdAndUpdate(booking.vehicle._id, {
      $inc: {
        "statistics.bookings": 1,
        "statistics.revenue": booking.pricing.totalAmount,
      },
    });

    res.json({
      success: true,
      message: "Zahlung erfolgreich bestätigt",
      data: booking,
    });
  } catch (error) {
    console.error("Confirm payment error:", error);
    res.status(500).json({
      success: false,
      message: "Fehler bei der Zahlungsbestätigung",
    });
  }
};

// Process refund
const processRefund = async (req, res) => {
  try {
    const { bookingId, amount, reason } = req.body;

    const booking = await Booking.findById(bookingId);

    if (!booking) {
      return res.status(404).json({
        success: false,
        message: "Buchung nicht gefunden",
      });
    }

    if (!booking.payment.stripeDetails.chargeId) {
      return res.status(400).json({
        success: false,
        message: "Keine Zahlung zum Erstatten gefunden",
      });
    }

    // Create refund in Stripe
    const refund = await stripe.refunds.create({
      charge: booking.payment.stripeDetails.chargeId,
      amount: amount ? Math.round(amount * 100) : undefined, // Partial refund if amount specified
      reason: reason || "requested_by_customer",
      metadata: {
        bookingId: booking._id.toString(),
        bookingNumber: booking.bookingNumber,
      },
    });

    // Update booking
    booking.payment.status = amount ? "partial_refund" : "refunded";
    booking.payment.transactions.push({
      type: amount ? "partial_refund" : "refund",
      amount: refund.amount / 100,
      status: "completed",
      transactionId: refund.id,
      processedAt: new Date(),
      details: reason,
    });

    if (booking.cancellation) {
      booking.cancellation.refundStatus = "completed";
      booking.cancellation.refundProcessedAt = new Date();
    }

    await booking.save();

    // Send refund confirmation email
    await sendRefundConfirmationEmail(booking, refund.amount / 100);

    res.json({
      success: true,
      message: "Rückerstattung erfolgreich verarbeitet",
      data: {
        refundId: refund.id,
        amount: refund.amount / 100,
        status: refund.status,
      },
    });
  } catch (error) {
    console.error("Process refund error:", error);
    res.status(500).json({
      success: false,
      message: "Fehler bei der Rückerstattung",
    });
  }
};

// Get payment details
const getPaymentDetails = async (req, res) => {
  try {
    const { bookingId } = req.params;

    const booking = await Booking.findById(bookingId)
      .select("payment pricing")
      .populate("user", "firstName lastName email");

    if (!booking) {
      return res.status(404).json({
        success: false,
        message: "Buchung nicht gefunden",
      });
    }

    // Check authorization
    if (
      req.user.role !== "admin" &&
      booking.user._id.toString() !== req.user._id.toString()
    ) {
      return res.status(403).json({
        success: false,
        message: "Keine Berechtigung",
      });
    }

    res.json({
      success: true,
      data: {
        payment: booking.payment,
        pricing: booking.pricing,
      },
    });
  } catch (error) {
    console.error("Get payment details error:", error);
    res.status(500).json({
      success: false,
      message: "Fehler beim Abrufen der Zahlungsdetails",
    });
  }
};

// Webhook handler for Stripe
const handleStripeWebhook = async (req, res) => {
  const sig = req.headers["stripe-signature"];
  let event;

  try {
    event = stripe.webhooks.constructEvent(
      req.rawBody,
      sig,
      process.env.STRIPE_WEBHOOK_SECRET
    );
  } catch (err) {
    console.error("Webhook signature verification failed:", err);
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  try {
    switch (event.type) {
      case "payment_intent.succeeded":
        await handlePaymentSucceeded(event.data.object);
        break;

      case "payment_intent.payment_failed":
        await handlePaymentFailed(event.data.object);
        break;

      case "charge.refunded":
        await handleRefundCompleted(event.data.object);
        break;

      default:
        console.log(`Unhandled event type ${event.type}`);
    }

    res.json({ received: true });
  } catch (error) {
    console.error("Webhook processing error:", error);
    res.status(500).json({ error: "Webhook processing failed" });
  }
};

// Helper functions
const handlePaymentSucceeded = async (paymentIntent) => {
  const booking = await Booking.findOne({
    "payment.stripeDetails.paymentIntentId": paymentIntent.id,
  });

  if (booking && booking.payment.status !== "completed") {
    booking.payment.status = "completed";
    booking.status = "confirmed";
    await booking.save();
    await sendPaymentConfirmationEmail(booking);
  }
};

const handlePaymentFailed = async (paymentIntent) => {
  const booking = await Booking.findOne({
    "payment.stripeDetails.paymentIntentId": paymentIntent.id,
  });

  if (booking) {
    booking.payment.status = "failed";
    await booking.save();
    await sendPaymentFailedEmail(booking);
  }
};

const handleRefundCompleted = async (charge) => {
  const booking = await Booking.findOne({
    "payment.stripeDetails.chargeId": charge.id,
  });

  if (booking) {
    booking.payment.status =
      charge.amount_refunded === charge.amount ? "refunded" : "partial_refund";
    await booking.save();
  }
};

const sendPaymentConfirmationEmail = async (booking) => {
  await sendEmail({
    to: booking.user.email,
    subject: "Zahlungsbestätigung - WohnmobilTraum",
    template: "paymentConfirmation",
    data: {
      userName: booking.user.firstName,
      bookingNumber: booking.bookingNumber,
      amount: booking.pricing.totalAmount,
      paymentMethod: booking.payment.method,
    },
  });
};

const sendRefundConfirmationEmail = async (booking, amount) => {
  await sendEmail({
    to: booking.user.email,
    subject: "Rückerstattungsbestätigung - WohnmobilTraum",
    template: "refundConfirmation",
    data: {
      userName: booking.user.firstName,
      bookingNumber: booking.bookingNumber,
      amount,
    },
  });
};

const sendPaymentFailedEmail = async (booking) => {
  await sendEmail({
    to: booking.user.email,
    subject: "Zahlung fehlgeschlagen - WohnmobilTraum",
    template: "paymentFailed",
    data: {
      userName: booking.user.firstName,
      bookingNumber: booking.bookingNumber,
    },
  });
};

module.exports = {
  createPaymentIntent,
  confirmPayment,
  processRefund,
  getPaymentDetails,
  handleStripeWebhook,
};
