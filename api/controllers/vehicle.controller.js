// backend/controllers/vehicle.controller.js
const Vehicle = require("../models/Vehicle.model");
const Booking = require("../models/Booking.model");
const { validationResult } = require("express-validator");
const cloudinary = require("../config/cloudinary");

// Get all vehicles with filters
const getVehicles = async (req, res) => {
  try {
    const {
      category,
      minPrice,
      maxPrice,
      seats,
      sleepingPlaces,
      location,
      startDate,
      endDate,
      features,
      sortBy,
      featured,
      page = 1,
      limit = 12,
    } = req.query;

    // Build query
    const query = { status: "aktiv", verificationStatus: "genehmigt" };

    if (category) {
      query.category = category;
    }

    if (minPrice || maxPrice) {
      query["pricing.basePrice.perDay"] = {};
      if (minPrice) query["pricing.basePrice.perDay"].$gte = Number(minPrice);
      if (maxPrice) query["pricing.basePrice.perDay"].$lte = Number(maxPrice);
    }

    if (seats) {
      query["capacity.seats"] = { $gte: Number(seats) };
    }

    if (sleepingPlaces) {
      query["capacity.sleepingPlaces"] = { $gte: Number(sleepingPlaces) };
    }

    if (features) {
      const featureArray = features.split(",");
      featureArray.forEach((feature) => {
        query[`equipment.${feature}`] = true;
      });
    }

    if (typeof featured !== "undefined") {
      query.featured = featured === "true";
    }

    // Location search
    if (location) {
      // Implement geocoding here if needed
      query.$or = [
        { "location.address.city": new RegExp(location, "i") },
        { "location.address.state": new RegExp(location, "i") },
        { "location.address.postalCode": new RegExp(location, "i") },
      ];
    }

    // Check availability for date range
    let availableVehicles = [];
    if (startDate && endDate) {
      const bookings = await Booking.find({
        $or: [
          {
            "dates.start": { $lte: new Date(endDate) },
            "dates.end": { $gte: new Date(startDate) },
          },
        ],
        status: { $in: ["confirmed", "active"] },
      }).select("vehicle");

      const bookedVehicleIds = bookings.map((b) => b.vehicle);
      query._id = { $nin: bookedVehicleIds };
    }

    // Sorting
    let sortOptions = { createdAt: -1 };
    if (sortBy === "price-asc") sortOptions = { "pricing.basePrice.perDay": 1 };
    if (sortBy === "price-desc")
      sortOptions = { "pricing.basePrice.perDay": -1 };
    if (sortBy === "rating") sortOptions = { "statistics.rating.average": -1 };
    if (sortBy === "popular") sortOptions = { "statistics.bookings": -1 };

    // Pagination
    const skip = (page - 1) * limit;

    const [vehicles, total] = await Promise.all([
      Vehicle.find(query)
        .populate("owner", "firstName lastName agentProfile.companyName")
        .sort(sortOptions)
        .skip(skip)
        .limit(Number(limit))
        .lean(),
      Vehicle.countDocuments(query),
    ]);

    res.json({
      success: true,
      data: {
        vehicles,
        pagination: {
          total,
          pages: Math.ceil(total / limit),
          currentPage: Number(page),
          perPage: Number(limit),
        },
      },
    });
  } catch (error) {
    console.error("Get vehicles error:", error);
    res.status(500).json({
      success: false,
      message: "Fehler beim Abrufen der Fahrzeuge",
    });
  }
};

// Get single vehicle
const getVehicle = async (req, res) => {
  try {
    const { slug } = req.params;

    const vehicle = await Vehicle.findOne({ slug })
      .populate("owner", "firstName lastName email")
      .lean();

    if (!vehicle) {
      return res.status(404).json({
        success: false,
        message: "Fahrzeug nicht gefunden",
      });
    }

    // Increment view count (do this without .save() since we used .lean())
    await Vehicle.findByIdAndUpdate(vehicle._id, {
      $inc: { "statistics.views": 1 },
    });

    // Get availability calendar
    const startDate = new Date();
    const endDate = new Date();
    endDate.setMonth(endDate.getMonth() + 3);

    const bookings = await Booking.find({
      vehicle: vehicle._id,
      "dates.start": { $lte: endDate },
      "dates.end": { $gte: startDate },
      status: { $in: ["confirmed", "active"] },
    }).select("dates");

    res.json({
      success: true,
      data: {
        vehicle,
        bookedDates: bookings,
      },
    });
  } catch (error) {
    console.error("Get vehicle error:", error);
    res.status(500).json({
      success: false,
      message: "Fehler beim Abrufen des Fahrzeugs",
      error: error.message,
    });
  }
};

// Create vehicle (Agent/Admin)
const createVehicle = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        errors: errors.array(),
      });
    }

    const vehicleData = {
      ...req.body,
      owner: req.user._id,
      verificationStatus:
        req.user.role === "admin" ? "genehmigt" : "ausstehend",
    };

    const vehicle = await Vehicle.create(vehicleData);

    // Add vehicle to agent's profile
    if (req.user.role === "agent") {
      await User.findByIdAndUpdate(req.user._id, {
        $push: { "agentProfile.vehicles": vehicle._id },
      });
    }

    res.status(201).json({
      success: true,
      message: "Fahrzeug erfolgreich erstellt",
      data: vehicle,
    });
  } catch (error) {
    console.error("Create vehicle error:", error);
    res.status(500).json({
      success: false,
      message: "Fehler beim Erstellen des Fahrzeugs",
    });
  }
};

// Update vehicle
const updateVehicle = async (req, res) => {
  try {
    const { id } = req.params;

    const vehicle = await Vehicle.findById(id);

    if (!vehicle) {
      return res.status(404).json({
        success: false,
        message: "Fahrzeug nicht gefunden",
      });
    }

    // Check ownership
    if (
      req.user.role !== "admin" &&
      vehicle.owner.toString() !== req.user._id.toString()
    ) {
      return res.status(403).json({
        success: false,
        message: "Keine Berechtigung",
      });
    }

    const updatedVehicle = await Vehicle.findByIdAndUpdate(id, req.body, {
      new: true,
      runValidators: true,
    });

    res.json({
      success: true,
      message: "Fahrzeug erfolgreich aktualisiert",
      data: updatedVehicle,
    });
  } catch (error) {
    console.error("Update vehicle error:", error);
    res.status(500).json({
      success: false,
      message: "Fehler beim Aktualisieren des Fahrzeugs",
    });
  }
};

// Delete vehicle
const deleteVehicle = async (req, res) => {
  try {
    const { id } = req.params;

    const vehicle = await Vehicle.findById(id);

    if (!vehicle) {
      return res.status(404).json({
        success: false,
        message: "Fahrzeug nicht gefunden",
      });
    }

    // Check ownership
    if (
      req.user.role !== "admin" &&
      vehicle.owner.toString() !== req.user._id.toString()
    ) {
      return res.status(403).json({
        success: false,
        message: "Keine Berechtigung",
      });
    }

    // Check for active bookings
    const activeBookings = await Booking.countDocuments({
      vehicle: id,
      status: { $in: ["confirmed", "active"] },
      "dates.end": { $gte: new Date() },
    });

    if (activeBookings > 0) {
      return res.status(400).json({
        success: false,
        message:
          "Fahrzeug kann nicht gelöscht werden, es gibt aktive Buchungen",
      });
    }

    // Soft delete
    vehicle.status = "ausgemustert";
    await vehicle.save();

    res.json({
      success: true,
      message: "Fahrzeug erfolgreich gelöscht",
    });
  } catch (error) {
    console.error("Delete vehicle error:", error);
    res.status(500).json({
      success: false,
      message: "Fehler beim Löschen des Fahrzeugs",
    });
  }
};

// Check availability
const checkAvailability = async (req, res) => {
  try {
    const { id } = req.params;
    const { startDate, endDate } = req.query;

    if (!startDate || !endDate) {
      return res.status(400).json({
        success: false,
        message: "Start- und Enddatum erforderlich",
      });
    }

    const bookings = await Booking.find({
      vehicle: id,
      $or: [
        {
          "dates.start": { $lte: new Date(endDate) },
          "dates.end": { $gte: new Date(startDate) },
        },
      ],
      status: { $in: ["confirmed", "active"] },
    });

    const isAvailable = bookings.length === 0;

    res.json({
      success: true,
      data: {
        available: isAvailable,
        conflictingBookings: bookings.length,
      },
    });
  } catch (error) {
    console.error("Check availability error:", error);
    res.status(500).json({
      success: false,
      message: "Fehler beim Prüfen der Verfügbarkeit",
    });
  }
};

module.exports = {
  getVehicles,
  getVehicle,
  createVehicle,
  updateVehicle,
  deleteVehicle,
  checkAvailability,
};
