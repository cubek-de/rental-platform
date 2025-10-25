// backend/controllers/booking.controller.js
const Booking = require("../models/Booking.model");
const Vehicle = require("../models/Vehicle.model");
const User = require("../models/User.model");
const { validationResult } = require("express-validator");
const sendEmail = require("../utils/sendEmail");
const {
  calculateInsurancePrice,
  getInsurancePackage,
  calculateRefundAmount,
} = require("../constants/insurance");

// Create booking
const createBooking = async (req, res) => {
  try {
    console.log("=== CREATE BOOKING REQUEST ===");
    console.log("User:", req.user?._id);
    console.log("Body:", JSON.stringify(req.body, null, 2));

    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      console.log("Validation errors:", errors.array());
      return res.status(400).json({
        success: false,
        errors: errors.array(),
      });
    }

    const {
      vehicleId,
      startDate,
      endDate,
      guestInfo,
      driverInfo,
      contactInfo,
      extras,
      insurance,
      paymentMethod,
    } = req.body;

    console.log("Extracted fields:", { vehicleId, startDate, endDate, insurance, paymentMethod });

    // Check vehicle availability
    const vehicle = await Vehicle.findById(vehicleId);
    if (!vehicle) {
      return res.status(404).json({
        success: false,
        message: "Fahrzeug nicht gefunden",
      });
    }

    // Check for conflicting bookings
    const conflictingBookings = await Booking.find({
      vehicle: vehicleId,
      $or: [
        {
          "dates.start": { $lte: new Date(endDate) },
          "dates.end": { $gte: new Date(startDate) },
        },
      ],
      status: { $in: ["confirmed", "active"] },
    });

    if (conflictingBookings.length > 0) {
      return res.status(400).json({
        success: false,
        message: "Fahrzeug ist in diesem Zeitraum nicht verfügbar",
      });
    }

    // Calculate pricing
    const numberOfDays = Math.ceil(
      (new Date(endDate) - new Date(startDate)) / (1000 * 60 * 60 * 24)
    );
    const basePrice = vehicle.pricing.basePrice.perDay * numberOfDays;

    // Apply discounts for longer rentals
    let discount = 0;
    if (numberOfDays >= 7) discount = basePrice * 0.1; // 10% weekly discount
    if (numberOfDays >= 30) discount = basePrice * 0.2; // 20% monthly discount

    // Calculate extras total
    let extrasTotal = 0;
    const processedExtras = (extras || [])
      .map((extra) => {
        if (!vehicle.pricing.extras || vehicle.pricing.extras.length === 0) {
          return null;
        }
        const vehicleExtra = vehicle.pricing.extras.find(
          (e) => e.name === extra.name
        );
        if (!vehicleExtra) return null;

        let total = 0;
        switch (vehicleExtra.priceType) {
          case "pro_Tag":
            total = vehicleExtra.price * (extra.quantity || 1) * numberOfDays;
            break;
          case "pro_Miete":
            total = vehicleExtra.price * (extra.quantity || 1);
            break;
          case "pro_Person":
            const totalGuests = (guestInfo.adults || 0) + (guestInfo.children || 0);
            total = vehicleExtra.price * (extra.quantity || 1) * totalGuests;
            break;
        }
        extrasTotal += total;

        return {
          ...extra,
          price: vehicleExtra.price,
          total,
          type: vehicleExtra.priceType,
        };
      })
      .filter(Boolean);

    // Calculate insurance using constants
    const insurancePackage = getInsurancePackage(insurance);
    const insurancePrice = calculateInsurancePrice(insurance, numberOfDays);

    // Calculate fees
    const serviceFee = (basePrice - discount + extrasTotal) * 0.05; // 5% service fee
    const cleaningFee = vehicle.pricing.cleaningFee || 0;

    // Calculate tax
    const subtotal =
      basePrice -
      discount +
      extrasTotal +
      insurancePrice +
      serviceFee +
      cleaningFee;
    const taxRate = 0.19; // 19% German VAT
    const taxAmount = subtotal * taxRate;

    // Total amount
    const totalAmount = subtotal + taxAmount;

    // Create booking
    const booking = await Booking.create({
      vehicle: vehicleId,
      user: req.user._id,
      dates: {
        start: new Date(startDate),
        end: new Date(endDate),
        numberOfDays,
      },
      guestInfo,
      driverInfo,
      contactInfo: contactInfo || {
        email: req.user.email,
        phone: req.user.profile?.phone || "",
        address: req.user.profile?.address || {},
      },
      pricing: {
        vehiclePrice: vehicle.pricing.basePrice.perDay,
        numberOfDays,
        dailyRate: vehicle.pricing.basePrice.perDay,
        subtotal: basePrice,
        weeklyDiscount: numberOfDays >= 7 ? discount : 0,
        monthlyDiscount: numberOfDays >= 30 ? discount : 0,
        extras: processedExtras,
        extrasTotal,
        insurance: {
          type: insurance,
          price: insurancePrice,
          deductible: insurancePackage.deductible,
        },
        fees: {
          serviceFee,
          cleaningFee,
          processingFee: 0,
        },
        deposit: {
          amount: vehicle.pricing.deposit,
          status: "pending",
        },
        taxes: {
          rate: taxRate,
          amount: taxAmount,
        },
        totalAmount,
        currency: "EUR",
      },
      payment: {
        method: paymentMethod,
        status: "pending",
      },
      status: "pending",
      metadata: {
        source: "website",
        ip: req.ip,
        userAgent: req.get("user-agent"),
      },
    });

    // Send confirmation email (async, don't wait)
    try {
      await sendEmail({
        to: contactInfo?.email || req.user.email,
        subject: "Buchungsbestätigung - WohnmobilTraum",
        html: `
          <h1>Buchungsbestätigung</h1>
          <p>Vielen Dank für Ihre Buchung!</p>
          <p><strong>Buchungsnummer:</strong> ${booking.bookingNumber}</p>
          <p><strong>Fahrzeug:</strong> ${vehicle.name}</p>
          <p><strong>Zeitraum:</strong> ${new Date(startDate).toLocaleDateString('de-DE')} - ${new Date(endDate).toLocaleDateString('de-DE')}</p>
          <p><strong>Gesamtbetrag:</strong> €${totalAmount.toFixed(2)}</p>
        `,
      });
    } catch (emailError) {
      console.error("Email error:", emailError);
      // Don't fail booking if email fails
    }

    res.status(201).json({
      success: true,
      message: "Buchung erfolgreich erstellt",
      data: booking,
    });
  } catch (error) {
    console.error("Create booking error:", error);
    console.error("Error stack:", error.stack);
    res.status(500).json({
      success: false,
      message: "Fehler beim Erstellen der Buchung",
      error: process.env.NODE_ENV === 'development' ? error.message : undefined,
    });
  }
};

// Get user bookings
const getUserBookings = async (req, res) => {
  try {
    const { status, page = 1, limit = 10 } = req.query;

    const query = { user: req.user._id };
    if (status) query.status = status;

    const skip = (page - 1) * limit;

    const [bookings, total] = await Promise.all([
      Booking.find(query)
        .populate(
          "vehicle",
          "name images category technicalData.brand technicalData.model"
        )
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(Number(limit))
        .lean(),
      Booking.countDocuments(query),
    ]);

    res.json({
      success: true,
      data: {
        bookings,
        pagination: {
          total,
          pages: Math.ceil(total / limit),
          currentPage: Number(page),
          perPage: Number(limit),
        },
      },
    });
  } catch (error) {
    console.error("Get user bookings error:", error);
    res.status(500).json({
      success: false,
      message: "Fehler beim Abrufen der Buchungen",
    });
  }
};

// Get single booking
const getBooking = async (req, res) => {
  try {
    const { id } = req.params;

    const booking = await Booking.findById(id)
      .populate("vehicle")
      .populate("user", "firstName lastName email profile.phone")
      .populate("review");

    if (!booking) {
      return res.status(404).json({
        success: false,
        message: "Buchung nicht gefunden",
      });
    }

    // Check authorization
    if (
      req.user.role !== "admin" &&
      booking.user._id.toString() !== req.user._id.toString() &&
      booking.vehicle.owner.toString() !== req.user._id.toString()
    ) {
      return res.status(403).json({
        success: false,
        message: "Keine Berechtigung",
      });
    }

    res.json({
      success: true,
      data: booking,
    });
  } catch (error) {
    console.error("Get booking error:", error);
    res.status(500).json({
      success: false,
      message: "Fehler beim Abrufen der Buchung",
    });
  }
};

// Update booking status
const updateBookingStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status, notes } = req.body;

    const booking = await Booking.findById(id)
      .populate("vehicle")
      .populate("user");

    if (!booking) {
      return res.status(404).json({
        success: false,
        message: "Buchung nicht gefunden",
      });
    }

    // Update status
    booking.status = status;

    // Add note
    if (notes) {
      booking.communication.notes.push({
        author: req.user._id,
        content: notes,
        createdAt: new Date(),
        isInternal: true,
      });
    }

    // Handle cancellation
    if (status === "cancelled") {
      booking.cancellation = {
        isCancelled: true,
        cancelledAt: new Date(),
        cancelledBy: req.user._id,
        reason: req.body.cancellationReason,
        refundAmount: calculateRefundAmount(booking),
        refundStatus: "pending",
      };
    }

    await booking.save();

    // Send status update email
    await sendStatusUpdateEmail(booking);

    res.json({
      success: true,
      message: "Buchungsstatus erfolgreich aktualisiert",
      data: booking,
    });
  } catch (error) {
    console.error("Update booking status error:", error);
    res.status(500).json({
      success: false,
      message: "Fehler beim Aktualisieren des Buchungsstatus",
    });
  }
};

// Process check-in
const processCheckIn = async (req, res) => {
  try {
    const { id } = req.params;
    const { mileageStart, fuelLevel, vehicleCondition, photos, notes } =
      req.body;

    const booking = await Booking.findById(id);

    if (!booking) {
      return res.status(404).json({
        success: false,
        message: "Buchung nicht gefunden",
      });
    }

    booking.checkIn = {
      actual: new Date(),
      mileageStart,
      fuelLevel,
      vehicleCondition,
      photos,
      notes,
      staffMember: req.user._id,
    };

    booking.status = "active";
    await booking.save();

    res.json({
      success: true,
      message: "Check-in erfolgreich durchgeführt",
      data: booking,
    });
  } catch (error) {
    console.error("Check-in error:", error);
    res.status(500).json({
      success: false,
      message: "Fehler beim Check-in",
    });
  }
};

// Process check-out
const processCheckOut = async (req, res) => {
  try {
    const { id } = req.params;
    const {
      mileageEnd,
      fuelLevel,
      vehicleCondition,
      damages,
      additionalCharges,
      photos,
      notes,
    } = req.body;

    const booking = await Booking.findById(id);

    if (!booking) {
      return res.status(404).json({
        success: false,
        message: "Buchung nicht gefunden",
      });
    }

    // Calculate excess mileage
    const totalMileage = mileageEnd - booking.checkIn.mileageStart;
    const includedMileage = booking.pricing.numberOfDays * 200; // 200km per day included
    const excessMileage = Math.max(0, totalMileage - includedMileage);
    const excessMileageCharge = excessMileage * 0.35; // €0.35 per extra km

    booking.checkOut = {
      actual: new Date(),
      mileageEnd,
      fuelLevel,
      totalMileage,
      excessMileage,
      excessMileageCharge,
      vehicleCondition,
      additionalCharges,
      photos,
      notes,
      staffMember: req.user._id,
    };

    // Process damages if any
    if (damages && damages.length > 0) {
      booking.checkOut.vehicleCondition.damages = damages;

      // Calculate total damage cost
      const totalDamageCost = damages.reduce(
        (sum, damage) => sum + damage.estimatedCost,
        0
      );

      // Deduct from deposit if necessary
      if (totalDamageCost > 0) {
        booking.pricing.deposit.forfeitReason = "Schäden am Fahrzeug";
        booking.pricing.deposit.releaseAmount = Math.max(
          0,
          booking.pricing.deposit.amount - totalDamageCost
        );
      }
    }

    booking.status = "completed";
    await booking.save();

    res.json({
      success: true,
      message: "Check-out erfolgreich durchgeführt",
      data: booking,
    });
  } catch (error) {
    console.error("Check-out error:", error);
    res.status(500).json({
      success: false,
      message: "Fehler beim Check-out",
    });
  }
};

// Cancel booking with refund
const cancelBooking = async (req, res) => {
  try {
    const { id } = req.params;
    const { reason } = req.body;

    const booking = await Booking.findById(id).populate("vehicle").populate("user");

    if (!booking) {
      return res.status(404).json({
        success: false,
        message: "Buchung nicht gefunden",
      });
    }

    // Check authorization - user, agent, or admin can cancel
    const isOwner = booking.user._id.toString() === req.user._id.toString();
    const isAgent =
      req.user.role === "agent" &&
      booking.vehicle.owner.toString() === req.user._id.toString();
    const isAdmin = req.user.role === "admin";

    if (!isOwner && !isAgent && !isAdmin) {
      return res.status(403).json({
        success: false,
        message: "Keine Berechtigung",
      });
    }

    if (booking.status === "cancelled") {
      return res.status(400).json({
        success: false,
        message: "Buchung ist bereits storniert",
      });
    }

    if (booking.status === "completed") {
      return res.status(400).json({
        success: false,
        message: "Abgeschlossene Buchungen können nicht storniert werden",
      });
    }

    // Calculate refund based on new policy
    const now = new Date();
    const startDate = new Date(booking.dates.start);
    const daysUntilStart = Math.ceil((startDate - now) / (1000 * 60 * 60 * 24));

    const refundInfo = calculateRefundAmount(booking.pricing.totalAmount, daysUntilStart);

    // Update booking
    booking.status = "cancelled";
    booking.cancellation = {
      isCancelled: true,
      cancelledAt: new Date(),
      cancelledBy: req.user._id,
      reason: reason || "Vom Kunden storniert",
      policy: refundInfo.policy.description,
      refundAmount: refundInfo.refundAmount,
      refundStatus: refundInfo.refundAmount > 0 ? "pending" : "not_applicable",
    };

    await booking.save();

    // Send cancellation email
    await sendCancellationEmail(booking, refundInfo);

    // Send notification to admin and agent
    const io = req.app.get("io");
    if (io) {
      io.to("admins").emit("notification", {
        type: "booking_cancelled",
        title: "Buchung storniert",
        message: `Buchung ${booking.bookingNumber} wurde storniert`,
        bookingId: booking._id,
      });

      if (booking.vehicle.owner) {
        io.to(`user:${booking.vehicle.owner}`).emit("notification", {
          type: "booking_cancelled",
          title: "Buchung storniert",
          message: `Buchung ${booking.bookingNumber} für ${booking.vehicle.name} wurde storniert`,
          bookingId: booking._id,
        });
      }
    }

    res.json({
      success: true,
      message: "Buchung erfolgreich storniert",
      data: {
        booking,
        refund: refundInfo,
      },
    });
  } catch (error) {
    console.error("Cancel booking error:", error);
    res.status(500).json({
      success: false,
      message: "Fehler beim Stornieren der Buchung",
      error: error.message,
    });
  }
};

const sendBookingConfirmationEmail = async (booking, user, vehicle) => {
  await sendEmail({
    to: user.email,
    subject: "Buchungsbestätigung - WohnmobilTraum",
    template: "bookingConfirmation",
    data: {
      userName: user.firstName,
      bookingNumber: booking.bookingNumber,
      vehicleName: vehicle.name,
      startDate: booking.dates.start,
      endDate: booking.dates.end,
      totalAmount: booking.pricing.totalAmount,
    },
  });
};

const sendStatusUpdateEmail = async (booking) => {
  const statusMessages = {
    confirmed: "Ihre Buchung wurde bestätigt",
    cancelled: "Ihre Buchung wurde storniert",
    completed: "Vielen Dank für Ihre Buchung",
  };

  await sendEmail({
    to: booking.user.email,
    subject: `Buchungsupdate - ${statusMessages[booking.status]}`,
    template: "bookingStatusUpdate",
    data: {
      userName: booking.user.firstName,
      bookingNumber: booking.bookingNumber,
      status: booking.status,
      message: statusMessages[booking.status],
    },
  });
};

const sendCancellationEmail = async (booking, refundInfo) => {
  await sendEmail({
    to: booking.user.email,
    subject: "Buchung storniert - WohnmobilTraum",
    template: "bookingCancellation",
    data: {
      userName: booking.user.firstName,
      bookingNumber: booking.bookingNumber,
      vehicleName: booking.vehicle.name,
      startDate: new Date(booking.dates.start).toLocaleDateString("de-DE"),
      endDate: new Date(booking.dates.end).toLocaleDateString("de-DE"),
      totalAmount: booking.pricing.totalAmount,
      refundAmount: refundInfo.refundAmount,
      refundPercentage: refundInfo.refundPercentage,
      refundPolicy: refundInfo.policy.description,
      cancellationReason: booking.cancellation.reason,
    },
  });
};

module.exports = {
  createBooking,
  getUserBookings,
  getBooking,
  updateBookingStatus,
  processCheckIn,
  processCheckOut,
  cancelBooking,
};
