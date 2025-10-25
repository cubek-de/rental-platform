// backend/models/Booking.model.js
const mongoose = require("mongoose");

const bookingSchema = new mongoose.Schema(
  {
    bookingNumber: {
      type: String,
      unique: true,
      required: false, // Auto-generated in pre-save hook
      index: true,
    },
    vehicle: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Vehicle",
      required: true,
      index: true,
    },
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },

    // Dates
    dates: {
      start: {
        type: Date,
        required: true,
        index: true,
      },
      end: {
        type: Date,
        required: true,
        index: true,
      },
      numberOfDays: Number,
      createdAt: {
        type: Date,
        default: Date.now,
      },
    },

    // Guest Information
    guestInfo: {
      adults: {
        type: Number,
        required: true,
        min: 1,
        max: 10,
      },
      children: {
        type: Number,
        default: 0,
        min: 0,
        max: 10,
      },
      pets: {
        type: Number,
        default: 0,
      },
      totalGuests: Number,
    },

    // Driver Information
    driverInfo: {
      firstName: String,
      lastName: String,
      dateOfBirth: Date,
      licenseNumber: String,
      licenseCountry: String,
      licenseIssueDate: Date,
      licenseExpiryDate: Date,
      licenseCategory: String,
      additionalDrivers: [
        {
          firstName: String,
          lastName: String,
          dateOfBirth: Date,
          licenseNumber: String,
          licenseCountry: String,
          licenseExpiryDate: Date,
        },
      ],
    },

    // Pricing Details
    pricing: {
      vehiclePrice: Number,
      numberOfDays: Number,
      dailyRate: Number,
      weeklyDiscount: Number,
      monthlyDiscount: Number,
      subtotal: Number,

      extras: [
        {
          name: String,
          price: Number,
          quantity: Number,
          total: Number,
          type: String, // 'per_day', 'per_rental', 'per_person'
        },
      ],
      extrasTotal: Number,

      insurance: {
        type: {
          type: String,
          enum: ["basic", "standard", "comprehensive", "premium"],
        },
        price: Number,
        deductible: Number,
      },

      fees: {
        serviceFee: Number,
        cleaningFee: Number,
        lateFee: Number,
        processingFee: Number,
      },

      discount: {
        code: String,
        type: {
          type: String,
          enum: ["percentage", "fixed"],
        },
        amount: Number,
        value: Number,
      },

      deposit: {
        amount: Number,
        status: {
          type: String,
          enum: ["pending", "held", "released", "partial_release", "forfeited"],
          default: "pending",
        },
        heldAt: Date,
        releasedAt: Date,
        releaseAmount: Number,
        forfeitReason: String,
      },

      taxes: {
        rate: Number,
        amount: Number,
      },

      totalAmount: Number,
      currency: {
        type: String,
        default: "EUR",
      },
    },

    // Payment Information
    payment: {
      method: {
        type: String,
        enum: ["stripe", "paypal", "bank_transfer", "cash", "split_payment"],
        required: true,
      },
      status: {
        type: String,
        enum: [
          "pending",
          "processing",
          "completed",
          "failed",
          "refunded",
          "partial_refund",
          "partially_paid",
        ],
        default: "pending",
        index: true,
      },

      // Split Payment (50% online + 50% cash)
      splitPayment: {
        enabled: {
          type: Boolean,
          default: false,
        },
        onlineAmount: Number,
        cashAmount: Number,
        onlinePaymentStatus: {
          type: String,
          enum: ["pending", "completed", "failed"],
          default: "pending",
        },
        cashPaymentStatus: {
          type: String,
          enum: ["pending", "completed"],
          default: "pending",
        },
        cashPaidAt: Date,
        cashReceivedBy: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "User",
        },
      },

      stripeDetails: {
        paymentIntentId: String,
        customerId: String,
        paymentMethodId: String,
        receiptUrl: String,
        chargeId: String,
      },

      paypalDetails: {
        orderId: String,
        payerId: String,
        paymentId: String,
      },

      transactions: [
        {
          type: {
            type: String,
            enum: [
              "payment",
              "refund",
              "partial_refund",
              "deposit_hold",
              "deposit_release",
              "cash_payment",
              "online_payment",
            ],
          },
          amount: Number,
          status: String,
          transactionId: String,
          processedAt: Date,
          details: String,
        },
      ],

      invoice: {
        number: String,
        issuedAt: Date,
        dueDate: Date,
        paidAt: Date,
        url: String,
        cloudinaryId: String,
      },
    },

    // Booking Status
    status: {
      type: String,
      enum: [
        "pending",
        "confirmed",
        "active",
        "completed",
        "cancelled",
        "no_show",
      ],
      default: "pending",
      index: true,
    },

    // Check-in/Check-out
    checkIn: {
      scheduled: Date,
      actual: Date,
      location: {
        address: String,
        coordinates: {
          lat: Number,
          lng: Number,
        },
      },
      mileageStart: Number,
      fuelLevel: Number,
      vehicleCondition: {
        exterior: {
          type: String,
          enum: ["excellent", "good", "fair", "poor"],
        },
        interior: {
          type: String,
          enum: ["excellent", "good", "fair", "poor"],
        },
        notes: String,
        photos: [String],
      },
      documents: [
        {
          type: String,
          url: String,
          verified: Boolean,
        },
      ],
      staffMember: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
      },
      signature: String,
      notes: String,
    },

    checkOut: {
      scheduled: Date,
      actual: Date,
      location: {
        address: String,
        coordinates: {
          lat: Number,
          lng: Number,
        },
      },
      mileageEnd: Number,
      fuelLevel: Number,
      totalMileage: Number,
      excessMileage: Number,
      excessMileageCharge: Number,

      vehicleCondition: {
        exterior: {
          type: String,
          enum: ["excellent", "good", "fair", "poor"],
        },
        interior: {
          type: String,
          enum: ["excellent", "good", "fair", "poor"],
        },
        damages: [
          {
            description: String,
            severity: {
              type: String,
              enum: ["minor", "moderate", "severe"],
            },
            estimatedCost: Number,
            photos: [String],
            chargedToCustomer: Boolean,
          },
        ],
        notes: String,
        photos: [String],
      },

      additionalCharges: [
        {
          reason: String,
          amount: Number,
          paid: Boolean,
        },
      ],

      staffMember: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
      },
      signature: String,
      notes: String,
    },

    // Communication
    communication: {
      emails: [
        {
          type: {
            type: String,
            enum: [
              "confirmation",
              "reminder",
              "update",
              "cancellation",
              "invoice",
            ],
          },
          sentAt: Date,
          subject: String,
          status: String,
        },
      ],
      sms: [
        {
          type: String,
          sentAt: Date,
          message: String,
          status: String,
        },
      ],
      notes: [
        {
          author: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
          },
          content: String,
          createdAt: Date,
          isInternal: Boolean,
        },
      ],
    },

    // Cancellation
    cancellation: {
      isCancelled: {
        type: Boolean,
        default: false,
      },
      cancelledAt: Date,
      cancelledBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
      },
      reason: String,
      policy: String,
      refundAmount: Number,
      refundStatus: String,
      refundProcessedAt: Date,
    },

    // Review
    review: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Review",
    },

    // Metadata
    metadata: {
      source: {
        type: String,
        enum: ["website", "mobile", "phone", "walk-in", "partner"],
        default: "website",
      },
      ip: String,
      userAgent: String,
      referrer: String,
      utmSource: String,
      utmMedium: String,
      utmCampaign: String,
    },
  },
  {
    timestamps: true,
  }
);

// Indexes for performance
bookingSchema.index({ "dates.start": 1, "dates.end": 1 });
bookingSchema.index({ vehicle: 1, "dates.start": 1, "dates.end": 1 });
bookingSchema.index({ user: 1, status: 1 });
bookingSchema.index({ status: 1, createdAt: -1 });
bookingSchema.index({ "payment.status": 1 });

// Generate booking number
bookingSchema.pre("save", async function (next) {
  if (!this.bookingNumber) {
    const date = new Date();
    const year = date.getFullYear().toString().substr(-2);
    const month = ("0" + (date.getMonth() + 1)).slice(-2);
    const day = ("0" + date.getDate()).slice(-2);

    // Get today's booking count
    const Model = this.constructor;
    const todayStart = new Date(date.setHours(0, 0, 0, 0));
    const todayEnd = new Date(date.setHours(23, 59, 59, 999));

    const count = await Model.countDocuments({
      createdAt: { $gte: todayStart, $lte: todayEnd },
    });

    const sequence = (count + 1).toString().padStart(4, "0");
    this.bookingNumber = `BK${year}${month}${day}${sequence}`;
  }

  // Calculate total guests
  if (this.guestInfo) {
    this.guestInfo.totalGuests =
      (this.guestInfo.adults || 0) + (this.guestInfo.children || 0);
  }

  // Calculate number of days
  if (this.dates?.start && this.dates?.end) {
    const diffTime = Math.abs(this.dates.end - this.dates.start);
    this.dates.numberOfDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    this.pricing.numberOfDays = this.dates.numberOfDays;
  }

  next();
});

// Virtual populate
bookingSchema.virtual("vehicleDetails", {
  ref: "Vehicle",
  localField: "vehicle",
  foreignField: "_id",
  justOne: true,
});

module.exports = mongoose.model("Booking", bookingSchema);
