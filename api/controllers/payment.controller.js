// backend/controllers/payment.controller.js
const stripe = require("stripe")(process.env.STRIPE_SECRET_KEY);
const Booking = require("../models/Booking.model");
const User = require("../models/User.model");
const Vehicle = require("../models/Vehicle.model");
const sendEmail = require("../utils/sendEmail");
const { generateInvoice } = require("../utils/invoiceGenerator");

// Create payment intent
const createPaymentIntent = async (req, res) => {
  try {
    const { bookingId, paymentOption } = req.body; // paymentOption: 'full' or 'split'

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

    // Calculate payment amount based on option
    let paymentAmount = booking.pricing.totalAmount;
    let isSplitPayment = paymentOption === "split";

    if (isSplitPayment) {
      paymentAmount = booking.pricing.totalAmount * 0.5; // 50% online

      // Update booking with split payment info
      booking.payment.method = "split_payment";
      booking.payment.splitPayment = {
        enabled: true,
        onlineAmount: paymentAmount,
        cashAmount: booking.pricing.totalAmount - paymentAmount,
        onlinePaymentStatus: "pending",
        cashPaymentStatus: "pending",
      };
    } else {
      booking.payment.method = "stripe";
    }

    // Create payment intent (EUR only, card payments only for German regulations)
    const paymentIntent = await stripe.paymentIntents.create({
      amount: Math.round(paymentAmount * 100), // Convert to cents
      currency: "eur",
      customer: stripeCustomerId,
      payment_method_types: ["card"], // Only card payments (debit/credit)
      metadata: {
        bookingId: booking._id.toString(),
        bookingNumber: booking.bookingNumber,
        paymentType: isSplitPayment ? "split_50_percent" : "full_payment",
      },
      description: `Buchung ${booking.bookingNumber} - ${booking.vehicle.name}${
        isSplitPayment ? " (50% Anzahlung)" : ""
      }`,
      // Enable Strong Customer Authentication (SCA) for EU compliance
    });

    // Update booking with payment intent ID
    booking.payment.stripeDetails.paymentIntentId = paymentIntent.id;
    booking.payment.stripeDetails.customerId = stripeCustomerId;
    await booking.save();

    res.json({
      success: true,
      data: {
        clientSecret: paymentIntent.client_secret,
        paymentIntentId: paymentIntent.id,
        amount: paymentAmount,
        isSplitPayment,
        cashAmount: isSplitPayment ? booking.pricing.totalAmount - paymentAmount : 0,
      },
    });
  } catch (error) {
    console.error("Create payment intent error:", error);
    res.status(500).json({
      success: false,
      message: "Fehler beim Erstellen der Zahlung",
      error: error.message,
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

    const isSplitPayment = booking.payment.splitPayment?.enabled;

    // Update booking payment status
    if (isSplitPayment) {
      // Split payment - only online portion paid
      booking.payment.splitPayment.onlinePaymentStatus = "completed";
      booking.payment.status = "partially_paid";
      booking.status = "pending"; // Keep pending for admin approval
    } else {
      // Full payment completed
      booking.payment.status = "completed";
      booking.status = "pending"; // Keep pending for admin approval
    }

    booking.payment.stripeDetails.chargeId = paymentIntent.latest_charge;
    booking.payment.stripeDetails.receiptUrl = paymentIntent.charges?.data[0]?.receipt_url;

    booking.payment.transactions.push({
      type: isSplitPayment ? "online_payment" : "payment",
      amount: paymentIntent.amount / 100,
      status: "completed",
      transactionId: paymentIntent.id,
      processedAt: new Date(),
      details: isSplitPayment ? "50% Online-Zahlung" : "Vollständige Zahlung",
    });

    // Generate invoice PDF
    try {
      const invoiceData = await generateInvoice(booking);
      booking.payment.invoice = invoiceData;
      booking.payment.invoice.paidAt = new Date();
    } catch (invoiceError) {
      console.error("Invoice generation error:", invoiceError);
      // Continue even if invoice fails - we'll generate it later
    }

    await booking.save();

    // Send confirmation email with invoice
    await sendPaymentConfirmationEmail(booking, isSplitPayment);

    // Send notification via Socket.io to admin and agent
    const io = req.app.get("io");
    if (io) {
      // Notify admin
      io.to("admins").emit("notification", {
        type: "booking",
        title: "Neue Buchung",
        message: `Neue Buchung ${booking.bookingNumber} erhalten`,
        bookingId: booking._id,
        data: booking,
      });

      // Notify agent/vehicle owner
      if (booking.vehicle.owner) {
        io.to(`user:${booking.vehicle.owner}`).emit("notification", {
          type: "booking",
          title: "Neue Buchung für Ihr Fahrzeug",
          message: `Buchung ${booking.bookingNumber} für ${booking.vehicle.name}`,
          bookingId: booking._id,
          data: booking,
        });
      }
    }

    // Update vehicle statistics
    await Vehicle.findByIdAndUpdate(booking.vehicle._id, {
      $inc: {
        "statistics.bookings": 1,
        "statistics.revenue": isSplitPayment
          ? booking.payment.splitPayment.onlineAmount
          : booking.pricing.totalAmount,
      },
    });

    res.json({
      success: true,
      message: isSplitPayment
        ? "Online-Zahlung erfolgreich. Barzahlung bei Abholung fällig."
        : "Zahlung erfolgreich bestätigt",
      data: {
        booking,
        invoice: booking.payment.invoice,
        remainingCash: isSplitPayment ? booking.payment.splitPayment.cashAmount : 0,
      },
    });
  } catch (error) {
    console.error("Confirm payment error:", error);
    res.status(500).json({
      success: false,
      message: "Fehler bei der Zahlungsbestätigung",
      error: error.message,
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

const sendPaymentConfirmationEmail = async (booking, isSplitPayment = false) => {
  const emailData = {
    userName: booking.user.firstName,
    bookingNumber: booking.bookingNumber,
    vehicleName: booking.vehicle.name,
    startDate: new Date(booking.dates.start).toLocaleDateString("de-DE"),
    endDate: new Date(booking.dates.end).toLocaleDateString("de-DE"),
    totalAmount: booking.pricing.totalAmount,
    paidAmount: isSplitPayment
      ? booking.payment.splitPayment.onlineAmount
      : booking.pricing.totalAmount,
    remainingAmount: isSplitPayment ? booking.payment.splitPayment.cashAmount : 0,
    paymentMethod: isSplitPayment ? "Teilzahlung (50% Online + 50% Bar)" : "Online-Zahlung",
    invoiceUrl: booking.payment.invoice?.url,
    invoiceNumber: booking.payment.invoice?.number,
    isSplitPayment,
  };

  await sendEmail({
    to: booking.user.email,
    subject: isSplitPayment
      ? "Anzahlung erhalten - Buchungsbestätigung - WohnmobilTraum"
      : "Zahlungsbestätigung & Rechnung - WohnmobilTraum",
    template: "paymentConfirmation",
    data: emailData,
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

// Mark cash payment as received (for split payments)
const markCashPaymentReceived = async (req, res) => {
  try {
    const { bookingId } = req.params;
    const { notes } = req.body;

    const booking = await Booking.findById(bookingId).populate("vehicle").populate("user");

    if (!booking) {
      return res.status(404).json({
        success: false,
        message: "Buchung nicht gefunden",
      });
    }

    // Only admin or agent can mark cash payment as received
    if (req.user.role !== "admin" && booking.vehicle.owner.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: "Keine Berechtigung",
      });
    }

    if (!booking.payment.splitPayment?.enabled) {
      return res.status(400).json({
        success: false,
        message: "Keine Teilzahlung für diese Buchung",
      });
    }

    if (booking.payment.splitPayment.cashPaymentStatus === "completed") {
      return res.status(400).json({
        success: false,
        message: "Barzahlung bereits erhalten",
      });
    }

    // Update cash payment status
    booking.payment.splitPayment.cashPaymentStatus = "completed";
    booking.payment.splitPayment.cashPaidAt = new Date();
    booking.payment.splitPayment.cashReceivedBy = req.user._id;
    booking.payment.status = "completed"; // Both payments now complete

    // Add transaction
    booking.payment.transactions.push({
      type: "cash_payment",
      amount: booking.payment.splitPayment.cashAmount,
      status: "completed",
      transactionId: `CASH-${booking.bookingNumber}-${Date.now()}`,
      processedAt: new Date(),
      details: notes || "Barzahlung bei Abholung erhalten",
    });

    await booking.save();

    // Update vehicle statistics with remaining amount
    await Vehicle.findByIdAndUpdate(booking.vehicle._id, {
      $inc: {
        "statistics.revenue": booking.payment.splitPayment.cashAmount,
      },
    });

    // Send email confirmation
    await sendCashPaymentConfirmationEmail(booking);

    res.json({
      success: true,
      message: "Barzahlung erfolgreich vermerkt",
      data: booking,
    });
  } catch (error) {
    console.error("Mark cash payment error:", error);
    res.status(500).json({
      success: false,
      message: "Fehler beim Vermerken der Barzahlung",
      error: error.message,
    });
  }
};

const sendCashPaymentConfirmationEmail = async (booking) => {
  await sendEmail({
    to: booking.user.email,
    subject: "Zahlung vollständig - WohnmobilTraum",
    template: "cashPaymentConfirmation",
    data: {
      userName: booking.user.firstName,
      bookingNumber: booking.bookingNumber,
      vehicleName: booking.vehicle.name,
      cashAmount: booking.payment.splitPayment.cashAmount,
      totalAmount: booking.pricing.totalAmount,
    },
  });
};

module.exports = {
  createPaymentIntent,
  confirmPayment,
  processRefund,
  getPaymentDetails,
  handleStripeWebhook,
  markCashPaymentReceived,
};
