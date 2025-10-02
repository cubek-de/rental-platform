// backend/models/Review.model.js
const mongoose = require("mongoose");

const reviewSchema = new mongoose.Schema(
  {
    booking: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Booking",
      required: true,
      unique: true,
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

    ratings: {
      overall: {
        type: Number,
        required: true,
        min: 1,
        max: 5,
      },
      cleanliness: {
        type: Number,
        min: 1,
        max: 5,
      },
      communication: {
        type: Number,
        min: 1,
        max: 5,
      },
      checkIn: {
        type: Number,
        min: 1,
        max: 5,
      },
      accuracy: {
        type: Number,
        min: 1,
        max: 5,
      },
      value: {
        type: Number,
        min: 1,
        max: 5,
      },
      condition: {
        type: Number,
        min: 1,
        max: 5,
      },
    },

    content: {
      title: {
        type: String,
        maxlength: 100,
      },
      text: {
        type: String,
        required: true,
        minlength: 10,
        maxlength: 1000,
      },
      pros: [String],
      cons: [String],
    },

    photos: [
      {
        url: String,
        caption: String,
      },
    ],

    response: {
      text: String,
      author: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
      },
      createdAt: Date,
    },

    helpful: {
      count: {
        type: Number,
        default: 0,
      },
      users: [
        {
          type: mongoose.Schema.Types.ObjectId,
          ref: "User",
        },
      ],
    },

    verified: {
      type: Boolean,
      default: false,
    },

    status: {
      type: String,
      enum: ["pending", "approved", "rejected"],
      default: "pending",
    },

    moderatedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },

    moderatedAt: Date,

    moderationNote: String,
  },
  {
    timestamps: true,
  }
);

// Indexes
reviewSchema.index({ vehicle: 1, createdAt: -1 });
reviewSchema.index({ user: 1 });
reviewSchema.index({ status: 1 });
reviewSchema.index({ "ratings.overall": -1 });

// Update vehicle rating after saving review
reviewSchema.post("save", async function () {
  const Review = this.constructor;
  const Vehicle = mongoose.model("Vehicle");

  const stats = await Review.aggregate([
    {
      $match: {
        vehicle: this.vehicle,
        status: "approved",
      },
    },
    {
      $group: {
        _id: null,
        avgRating: { $avg: "$ratings.overall" },
        count: { $sum: 1 },
      },
    },
  ]);

  if (stats.length > 0) {
    await Vehicle.findByIdAndUpdate(this.vehicle, {
      "statistics.rating.average": Math.round(stats[0].avgRating * 10) / 10,
      "statistics.rating.count": stats[0].count,
    });
  }
});

module.exports = mongoose.model("Review", reviewSchema);
