// backend/controllers/admin.controller.js
const User = require("../models/User.model");
const Vehicle = require("../models/Vehicle.model");
const Booking = require("../models/Booking.model");
const Review = require("../models/Review.model");
const { createNotification } = require("./notification.controller");

// Dashboard statistics
const getDashboardStats = async (req, res) => {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const thisMonth = new Date();
    thisMonth.setDate(1);
    thisMonth.setHours(0, 0, 0, 0);

    const lastMonth = new Date();
    lastMonth.setMonth(lastMonth.getMonth() - 1);
    lastMonth.setDate(1);
    lastMonth.setHours(0, 0, 0, 0);

    // Get statistics
    const [
      totalUsers,
      totalVehicles,
      pendingVehicles,
      totalBookings,
      activeBookings,
      todayBookings,
      pendingBookings,
      monthlyRevenue,
      lastMonthRevenue,
      pendingReviews,
      recentBookings,
      topVehicles,
    ] = await Promise.all([
      User.countDocuments({ role: "user" }),
      Vehicle.countDocuments({ status: "aktiv" }),
      Vehicle.countDocuments({ verificationStatus: "ausstehend" }),
      Booking.countDocuments(),
      Booking.countDocuments({ status: "active" }),
      Booking.countDocuments({ createdAt: { $gte: today } }),
      Booking.countDocuments({ status: "pending" }),

      Booking.aggregate([
        {
          $match: {
            createdAt: { $gte: thisMonth },
            "payment.status": "completed",
          },
        },
        {
          $group: {
            _id: null,
            total: { $sum: "$pricing.totalAmount" },
          },
        },
      ]),

      Booking.aggregate([
        {
          $match: {
            createdAt: { $gte: lastMonth, $lt: thisMonth },
            "payment.status": "completed",
          },
        },
        {
          $group: {
            _id: null,
            total: { $sum: "$pricing.totalAmount" },
          },
        },
      ]),

      Review.countDocuments({ status: "pending" }),

      Booking.find()
        .populate("user", "firstName lastName email")
        .populate("vehicle", "name")
        .sort({ createdAt: -1 })
        .limit(10)
        .lean(),

      Vehicle.find().sort({ "statistics.bookings": -1 }).limit(5).lean(),
    ]);

    // Calculate growth rates
    const currentRevenue = monthlyRevenue[0]?.total || 0;
    const previousRevenue = lastMonthRevenue[0]?.total || 0;
    const revenueGrowth =
      previousRevenue > 0
        ? (
            ((currentRevenue - previousRevenue) / previousRevenue) *
            100
          ).toFixed(2)
        : 0;

    res.json({
      success: true,
      data: {
        overview: {
          totalUsers,
          totalVehicles,
          pendingVehicles,
          totalBookings,
          activeBookings,
          todayBookings,
          pendingBookings,
          pendingReviews,
        },
        revenue: {
          monthly: currentRevenue,
          lastMonth: previousRevenue,
          growth: revenueGrowth,
        },
        recentBookings,
        topVehicles,
      },
    });
  } catch (error) {
    console.error("Get dashboard stats error:", error);
    res.status(500).json({
      success: false,
      message: "Fehler beim Abrufen der Dashboard-Statistiken",
    });
  }
};

// Get all users with filters
const getUsers = async (req, res) => {
  try {
    const {
      role,
      status,
      verified,
      search,
      sortBy = "createdAt",
      order = "desc",
      page = 1,
      limit = 20,
    } = req.query;

    const query = {};

    if (role) query.role = role;
    if (status) query.status = status;
    if (verified !== undefined)
      query["security.emailVerified"] = verified === "true";

    if (search) {
      query.$or = [
        { firstName: new RegExp(search, "i") },
        { lastName: new RegExp(search, "i") },
        { email: new RegExp(search, "i") },
      ];
    }

    const skip = (page - 1) * limit;
    const sort = { [sortBy]: order === "desc" ? -1 : 1 };

    const [users, total] = await Promise.all([
      User.find(query)
        .select("-password -security.sessions")
        .sort(sort)
        .skip(skip)
        .limit(Number(limit))
        .lean(),
      User.countDocuments(query),
    ]);

    res.json({
      success: true,
      data: {
        users,
        pagination: {
          total,
          pages: Math.ceil(total / limit),
          currentPage: Number(page),
          perPage: Number(limit),
        },
      },
    });
  } catch (error) {
    console.error("Get users error:", error);
    res.status(500).json({
      success: false,
      message: "Fehler beim Abrufen der Benutzer",
    });
  }
};

// Update user
const updateUser = async (req, res) => {
  try {
    const { id } = req.params;
    const updates = req.body;

    // Prevent updating sensitive fields
    delete updates.password;
    delete updates.stripeCustomerId;
    delete updates.security;

    const user = await User.findByIdAndUpdate(id, updates, {
      new: true,
      runValidators: true,
    }).select("-password -security.sessions");

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "Benutzer nicht gefunden",
      });
    }

    res.json({
      success: true,
      message: "Benutzer erfolgreich aktualisiert",
      data: user,
    });
  } catch (error) {
    console.error("Update user error:", error);
    res.status(500).json({
      success: false,
      message: "Fehler beim Aktualisieren des Benutzers",
    });
  }
};

// Delete user
const deleteUser = async (req, res) => {
  try {
    const { id } = req.params;

    // Check if user exists
    const user = await User.findById(id);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "Benutzer nicht gefunden",
      });
    }

    // Prevent deleting admin users (safety check)
    if (user.role === "admin") {
      return res.status(403).json({
        success: false,
        message: "Administrator-Benutzer können nicht gelöscht werden",
      });
    }

    // Delete the user
    await User.findByIdAndDelete(id);

    res.json({
      success: true,
      message: "Benutzer erfolgreich gelöscht",
    });
  } catch (error) {
    console.error("Delete user error:", error);
    res.status(500).json({
      success: false,
      message: "Fehler beim Löschen des Benutzers",
    });
  }
};

// Create user (admin only)
const createUser = async (req, res) => {
  try {
    const {
      firstName,
      lastName,
      email,
      password,
      phone,
      role = "user",
    } = req.body;

    // Validate required fields
    if (!firstName || !lastName || !email || !password) {
      return res.status(400).json({
        success: false,
        message: "Vorname, Nachname, E-Mail und Passwort sind erforderlich",
      });
    }

    // Check if user already exists
    const existingUser = await User.findOne({ email: email.toLowerCase() });
    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: "Benutzer mit dieser E-Mail-Adresse existiert bereits",
      });
    }

    // Create user with role
    const user = await User.create({
      firstName,
      lastName,
      email: email.toLowerCase(),
      password,
      role,
      "profile.phone": phone,
      "security.emailVerified": true, // Admin created users are auto-verified
    });

    // Remove password from response
    const userResponse = user.toObject();
    delete userResponse.password;
    delete userResponse.security;

    res.status(201).json({
      success: true,
      message: "Benutzer erfolgreich erstellt",
      data: userResponse,
    });
  } catch (error) {
    console.error("Create user error:", error);
    res.status(500).json({
      success: false,
      message: "Fehler beim Erstellen des Benutzers",
    });
  }
};

// Get all vehicles (admin only)
const getVehicles = async (req, res) => {
  try {
    const { verificationStatus } = req.query;
    const query = {};

    if (verificationStatus) {
      query.verificationStatus = verificationStatus;
    }

    const vehicles = await Vehicle.find(query)
      .populate("owner", "firstName lastName email agentProfile.companyName")
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      data: {
        vehicles,
        count: vehicles.length,
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

// Get pending vehicles for admin approval
const getPendingVehicles = async (req, res) => {
  try {
    const pendingVehicles = await Vehicle.find({
      verificationStatus: "ausstehend",
    })
      .populate("owner", "firstName lastName email agentProfile.companyName")
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      data: {
        vehicles: pendingVehicles,
        count: pendingVehicles.length,
      },
    });
  } catch (error) {
    console.error("Get pending vehicles error:", error);
    res.status(500).json({
      success: false,
      message: "Fehler beim Abrufen der ausstehenden Fahrzeuge",
    });
  }
};

// Upload vehicle image
const uploadVehicleImage = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: "Kein Bild hochgeladen" });
    }

    // Image is already uploaded to Cloudinary by multer middleware
    res.status(200).json({
      success: true,
      imageUrl: req.file.path, // Cloudinary URL from multer-storage-cloudinary
      publicId: req.file.filename, // Cloudinary public ID
    });
  } catch (error) {
    console.error("Image upload error:", error);
    res.status(500).json({
      message: "Fehler beim Hochladen des Bildes",
      error: error.message,
    });
  }
};

// Vehicle CRUD operations
// Create vehicle (admin only)
const createVehicle = async (req, res) => {
  try {
    const vehicleData = req.body;
    console.log("Creating vehicle with data:", vehicleData); // Debug log

    // Validate required fields
    if (!vehicleData.name || !vehicleData.category) {
      return res.status(400).json({
        success: false,
        message: "Name und Kategorie sind erforderlich",
      });
    }

    // Prepare complete vehicle data with defaults for required fields
    const completeVehicleData = {
      name: vehicleData.name,
      category: vehicleData.category,

      // Technical data with defaults
      technicalData: {
        brand: vehicleData.technicalData?.brand || "Unbekannt",
        model: vehicleData.technicalData?.model || "Unbekannt",
        year: vehicleData.technicalData?.year || new Date().getFullYear(),
        length: vehicleData.technicalData?.length || 6.0,
        width: vehicleData.technicalData?.width || 2.3,
        height: vehicleData.technicalData?.height || 2.8,
        weight: vehicleData.technicalData?.weight || 3500,
        maxWeight: vehicleData.technicalData?.maxWeight || 3500,
        fuelType: vehicleData.technicalData?.fuelType || "Diesel",
        transmission: vehicleData.technicalData?.transmission || "Manuell",
        requiredLicense: vehicleData.technicalData?.requiredLicense || "B",
      },

      // Capacity with defaults
      capacity: {
        seats: vehicleData.capacity?.seats || 4,
        sleepingPlaces: vehicleData.capacity?.sleepingPlaces || 2,
        beds: {
          fixed: vehicleData.capacity?.beds?.fixed || 1,
          convertible: vehicleData.capacity?.beds?.convertible || 1,
        },
      },

      // Equipment with defaults
      equipment: vehicleData.equipment || {
        kitchen: { available: true },
        bathroom: { available: true },
        climate: { heating: true },
        safety: {},
        comfort: {},
        entertainment: {},
        storage: {},
        outdoor: {},
        kitchen_equipment: {},
        cleaning: {},
        other: {},
      },

      // Pricing with defaults
      pricing: {
        basePrice: {
          perDay: vehicleData.pricing?.basePrice?.perDay || 50,
        },
        deposit: vehicleData.pricing?.deposit || 500,
        cleaningFee: vehicleData.pricing?.cleaningFee || 50,
        mileage: {
          included: 200,
          extraCost: 0.35,
        },
        insurance: {
          basic: 15,
          comprehensive: 25,
          deductible: 1500,
        },
      },

      // Images - placeholder image if none provided
      images: vehicleData.images || [
        {
          url: "https://via.placeholder.com/800x600?text=Fahrzeugbild",
          caption: "Standard Fahrzeugbild",
          isMain: true,
          order: 1,
        },
      ],

      // Description with defaults
      description: {
        short:
          vehicleData.description?.short ||
          vehicleData.description ||
          "Standard Fahrzeugbeschreibung",
        long:
          vehicleData.description?.long ||
          vehicleData.description ||
          "Detaillierte Fahrzeugbeschreibung folgt.",
        highlights: vehicleData.description?.highlights || [
          "Komfortabel",
          "Gut ausgestattet",
        ],
      },

      // Location with defaults
      location: vehicleData.location || {
        address: {
          street: "Hauptstraße 1",
          city: "Berlin",
          state: "Berlin",
          postalCode: "10115",
          country: "Deutschland",
        },
      },

      // Other required fields
      owner: req.user._id,
      status: "aktiv",
      isApproved: true,
    };

    // Set default values for admin created vehicles
    const vehicle = await Vehicle.create(completeVehicleData);

    console.log("Vehicle created successfully:", vehicle._id); // Debug log

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
      error: error.message,
    });
  }
};

// Update vehicle
const updateVehicle = async (req, res) => {
  try {
    const { id } = req.params;
    const updates = req.body;

    // Get the existing vehicle first
    const existingVehicle = await Vehicle.findById(id);
    if (!existingVehicle) {
      return res.status(404).json({
        success: false,
        message: "Fahrzeug nicht gefunden",
      });
    }

    // Merge updates with existing data to maintain required fields
    const mergedData = {
      ...existingVehicle.toObject(),
      ...updates,
      technicalData: {
        ...existingVehicle.technicalData,
        ...updates.technicalData,
      },
      capacity: {
        ...existingVehicle.capacity,
        ...updates.capacity,
      },
      pricing: {
        ...existingVehicle.pricing,
        ...updates.pricing,
        basePrice: {
          ...existingVehicle.pricing?.basePrice,
          ...updates.pricing?.basePrice,
        },
      },
    };

    const vehicle = await Vehicle.findByIdAndUpdate(id, mergedData, {
      new: true,
      runValidators: true,
    });

    res.json({
      success: true,
      message: "Fahrzeug erfolgreich aktualisiert",
      data: vehicle,
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

    // Check if vehicle exists
    const vehicle = await Vehicle.findById(id);
    if (!vehicle) {
      return res.status(404).json({
        success: false,
        message: "Fahrzeug nicht gefunden",
      });
    }

    // Check for active bookings
    const activeBookings = await Booking.countDocuments({
      vehicle: id,
      status: { $in: ["confirmed", "active"] },
    });

    if (activeBookings > 0) {
      return res.status(400).json({
        success: false,
        message:
          "Fahrzeug kann nicht gelöscht werden - es gibt aktive Buchungen",
      });
    }

    // Delete the vehicle
    await Vehicle.findByIdAndDelete(id);

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

// Get all bookings
const getAllBookings = async (req, res) => {
  try {
    const {
      status,
      vehicleId,
      userId,
      dateFrom,
      dateTo,
      sortBy = "createdAt",
      order = "desc",
      page = 1,
      limit = 20,
    } = req.query;

    const query = {};

    if (status) query.status = status;
    if (vehicleId) query.vehicle = vehicleId;
    if (userId) query.user = userId;

    if (dateFrom || dateTo) {
      query["dates.start"] = {};
      if (dateFrom) query["dates.start"].$gte = new Date(dateFrom);
      if (dateTo) query["dates.start"].$lte = new Date(dateTo);
    }

    const skip = (page - 1) * limit;
    const sort = { [sortBy]: order === "desc" ? -1 : 1 };

    const [bookings, total] = await Promise.all([
      Booking.find(query)
        .populate("user", "firstName lastName email")
        .populate("vehicle", "name category")
        .sort(sort)
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
    console.error("Get all bookings error:", error);
    res.status(500).json({
      success: false,
      message: "Fehler beim Abrufen der Buchungen",
    });
  }
};

// Verify vehicle
const verifyVehicle = async (req, res) => {
  try {
    const { id } = req.params;
    const { status, notes } = req.body;

    // Validate status
    if (!["genehmigt", "abgelehnt"].includes(status)) {
      return res.status(400).json({
        success: false,
        message: "Ungültiger Status. Verwenden Sie 'genehmigt' oder 'abgelehnt'",
      });
    }

    const vehicle = await Vehicle.findById(id).populate(
      "owner",
      "firstName lastName email"
    );

    if (!vehicle) {
      return res.status(404).json({
        success: false,
        message: "Fahrzeug nicht gefunden",
      });
    }

    const io = req.app.get("io");

    // Handle rejection - delete vehicle
    if (status === "abgelehnt") {
      // Send rejection notification to agent
      await createNotification(
        {
          recipient: vehicle.owner._id,
          sender: req.user._id,
          type: "vehicle_rejected",
          title: "Fahrzeug abgelehnt",
          message: `Ihr Fahrzeug "${vehicle.name}" wurde abgelehnt. ${
            notes ? `Grund: ${notes}` : ""
          }`,
          relatedVehicle: vehicle._id,
          metadata: {
            vehicleName: vehicle.name,
            rejectionReason: notes || "Keine Angabe",
            rejectedBy: `${req.user.firstName} ${req.user.lastName}`,
          },
        },
        io
      );

      // Delete vehicle from database
      await Vehicle.findByIdAndDelete(id);

      // Remove vehicle from agent's profile
      await User.findByIdAndUpdate(vehicle.owner._id, {
        $pull: { "agentProfile.vehicles": vehicle._id },
      });

      return res.json({
        success: true,
        message: "Fahrzeug abgelehnt und gelöscht",
      });
    }

    // Handle approval
    vehicle.verificationStatus = status;
    if (notes) {
      if (!vehicle.metadata) {
        vehicle.metadata = {};
      }
      if (!vehicle.metadata.verificationNotes) {
        vehicle.metadata.verificationNotes = [];
      }
      vehicle.metadata.verificationNotes.push({
        note: notes,
        addedBy: req.user._id,
        addedAt: new Date(),
      });
    }
    await vehicle.save();

    // Send approval notification to agent
    await createNotification(
      {
        recipient: vehicle.owner._id,
        sender: req.user._id,
        type: "vehicle_approved",
        title: "Fahrzeug genehmigt",
        message: `Ihr Fahrzeug "${vehicle.name}" wurde genehmigt und ist jetzt für Buchungen verfügbar.`,
        relatedVehicle: vehicle._id,
        actionUrl: `/agent/vehicles/${vehicle._id}`,
        metadata: {
          vehicleName: vehicle.name,
          approvedBy: `${req.user.firstName} ${req.user.lastName}`,
        },
      },
      io
    );

    // Send notification email
    // TODO: Implement sendVehicleVerificationEmail function
    // await sendVehicleVerificationEmail(vehicle, status);

    res.json({
      success: true,
      message: "Fahrzeug genehmigt",
      data: vehicle,
    });
  } catch (error) {
    console.error("Verify vehicle error:", error);
    res.status(500).json({
      success: false,
      message: "Fehler bei der Fahrzeugverifizierung",
    });
  }
};

// Get analytics data
const getAnalytics = async (req, res) => {
  try {
    const { period = "7d" } = req.query;

    let startDate = new Date();
    switch (period) {
      case "24h":
        startDate.setHours(startDate.getHours() - 24);
        break;
      case "7d":
        startDate.setDate(startDate.getDate() - 7);
        break;
      case "30d":
        startDate.setDate(startDate.getDate() - 30);
        break;
      case "90d":
        startDate.setDate(startDate.getDate() - 90);
        break;
      case "1y":
        startDate.setFullYear(startDate.getFullYear() - 1);
        break;
    }

    // Revenue analytics
    const revenueData = await Booking.aggregate([
      {
        $match: {
          createdAt: { $gte: startDate },
          "payment.status": "completed",
        },
      },
      {
        $group: {
          _id: {
            year: { $year: "$createdAt" },
            month: { $month: "$createdAt" },
            day: { $dayOfMonth: "$createdAt" },
          },
          revenue: { $sum: "$pricing.totalAmount" },
          bookings: { $sum: 1 },
        },
      },
      {
        $sort: { "_id.year": 1, "_id.month": 1, "_id.day": 1 },
      },
    ]);

    // Booking status distribution
    const bookingStatusData = await Booking.aggregate([
      {
        $match: {
          createdAt: { $gte: startDate },
        },
      },
      {
        $group: {
          _id: "$status",
          count: { $sum: 1 },
        },
      },
    ]);

    // Vehicle category performance
    const categoryPerformance = await Booking.aggregate([
      {
        $match: {
          createdAt: { $gte: startDate },
          "payment.status": "completed",
        },
      },
      {
        $lookup: {
          from: "vehicles",
          localField: "vehicle",
          foreignField: "_id",
          as: "vehicleData",
        },
      },
      {
        $unwind: "$vehicleData",
      },
      {
        $group: {
          _id: "$vehicleData.category",
          revenue: { $sum: "$pricing.totalAmount" },
          bookings: { $sum: 1 },
        },
      },
    ]);

    // User acquisition
    const userGrowth = await User.aggregate([
      {
        $match: {
          createdAt: { $gte: startDate },
        },
      },
      {
        $group: {
          _id: {
            year: { $year: "$createdAt" },
            month: { $month: "$createdAt" },
            day: { $dayOfMonth: "$createdAt" },
          },
          newUsers: { $sum: 1 },
        },
      },
      {
        $sort: { "_id.year": 1, "_id.month": 1, "_id.day": 1 },
      },
    ]);

    // Popular vehicles
    const popularVehicles = await Booking.aggregate([
      {
        $match: {
          createdAt: { $gte: startDate },
        },
      },
      {
        $group: {
          _id: "$vehicle",
          bookingCount: { $sum: 1 },
          revenue: { $sum: "$pricing.totalAmount" },
        },
      },
      {
        $sort: { bookingCount: -1 },
      },
      {
        $limit: 10,
      },
      {
        $lookup: {
          from: "vehicles",
          localField: "_id",
          foreignField: "_id",
          as: "vehicleData",
        },
      },
      {
        $unwind: "$vehicleData",
      },
      {
        $project: {
          name: "$vehicleData.name",
          category: "$vehicleData.category",
          bookingCount: 1,
          revenue: 1,
        },
      },
    ]);

    res.json({
      success: true,
      data: {
        revenue: revenueData,
        bookingStatus: bookingStatusData,
        categoryPerformance,
        userGrowth,
        popularVehicles,
        period,
      },
    });
  } catch (error) {
    console.error("Get analytics error:", error);
    res.status(500).json({
      success: false,
      message: "Fehler beim Abrufen der Analytikdaten",
    });
  }
};

// System settings
const getSystemSettings = async (req, res) => {
  try {
    // Get system settings from database or config
    const settings = {
      general: {
        siteName: "WohnmobilTraum",
        siteUrl: process.env.FRONTEND_URL,
        supportEmail: "support@wohnmobiltraum.de",
        defaultCurrency: "EUR",
        defaultLanguage: "de",
      },
      booking: {
        minBookingDays: 2,
        maxBookingDays: 30,
        advanceBookingDays: 365,
        cancellationPolicy: "moderat",
        depositPercentage: 30,
      },
      payment: {
        enabledMethods: ["stripe", "paypal", "bank_transfer", "cash"],
        stripePublicKey: process.env.STRIPE_PUBLIC_KEY,
        taxRate: 19,
      },
      email: {
        fromName: "WohnmobilTraum",
        fromEmail: "noreply@wohnmobiltraum.de",
        enableNotifications: true,
      },
      commission: {
        agentCommissionRate: 15,
        platformFeeRate: 5,
      },
    };

    res.json({
      success: true,
      data: settings,
    });
  } catch (error) {
    console.error("Get system settings error:", error);
    res.status(500).json({
      success: false,
      message: "Fehler beim Abrufen der Systemeinstellungen",
    });
  }
};

// Get pending bookings
const getPendingBookings = async (req, res) => {
  try {
    const pendingBookings = await Booking.find({ status: "pending" })
      .populate("user", "firstName lastName email profile.phone")
      .populate("vehicle", "name category images pricing.basePrice")
      .sort({ createdAt: -1 })
      .lean();

    res.json({
      success: true,
      data: pendingBookings,
    });
  } catch (error) {
    console.error("Get pending bookings error:", error);
    res.status(500).json({
      success: false,
      message: "Fehler beim Abrufen der ausstehenden Buchungen",
    });
  }
};

// Approve booking
const approveBooking = async (req, res) => {
  try {
    const { bookingId } = req.params;
    const { notes } = req.body;

    const booking = await Booking.findById(bookingId)
      .populate("user", "firstName lastName email")
      .populate("vehicle", "name");

    if (!booking) {
      return res.status(404).json({
        success: false,
        message: "Buchung nicht gefunden",
      });
    }

    if (booking.status !== "pending") {
      return res.status(400).json({
        success: false,
        message: "Diese Buchung kann nicht mehr genehmigt werden",
      });
    }

    booking.status = "confirmed";
    await booking.save();

    // Send confirmation notification to user (optional, don't fail if it errors)
    try {
      const io = req.app.get("io");
      if (io && createNotification) {
        await createNotification(
          {
            recipient: booking.user._id,
            sender: req.user._id,
            type: "booking_confirmed",
            title: "Buchung bestätigt",
            message: `Ihre Buchung #${booking.bookingNumber} wurde bestätigt!`,
            relatedBooking: booking._id,
            actionUrl: `/dashboard/bookings/${booking._id}`,
            metadata: {
              bookingNumber: booking.bookingNumber,
              vehicleName: booking.vehicle.name,
              confirmedBy: `${req.user.firstName} ${req.user.lastName}`,
              notes: notes || "",
            },
          },
          io
        );
      }
    } catch (notificationError) {
      console.error("Notification error (non-critical):", notificationError.message);
      // Continue anyway - notification failure shouldn't block approval
    }

    res.json({
      success: true,
      message: "Buchung erfolgreich genehmigt",
      data: booking,
    });
  } catch (error) {
    console.error("Approve booking error:", error);
    console.error("Error stack:", error.stack);
    res.status(500).json({
      success: false,
      message: "Fehler bei der Buchungsgenehmigung",
      error: error.message,
    });
  }
};

// Reject booking
const rejectBooking = async (req, res) => {
  try {
    const { bookingId } = req.params;
    const { reason } = req.body;

    const booking = await Booking.findById(bookingId)
      .populate("user", "firstName lastName email")
      .populate("vehicle", "name");

    if (!booking) {
      return res.status(404).json({
        success: false,
        message: "Buchung nicht gefunden",
      });
    }

    if (booking.status !== "pending") {
      return res.status(400).json({
        success: false,
        message: "Diese Buchung kann nicht mehr abgelehnt werden",
      });
    }

    // Process Stripe refund if payment was made
    let refundInfo = null;
    if (
      booking.payment?.method === "stripe" &&
      booking.payment?.stripeDetails?.paymentIntentId &&
      (booking.payment?.status === "completed" || booking.payment?.status === "partially_paid")
    ) {
      try {
        const stripe = require("stripe")(process.env.STRIPE_SECRET_KEY);

        // Create refund
        const refund = await stripe.refunds.create({
          payment_intent: booking.payment.stripeDetails.paymentIntentId,
          reason: "requested_by_customer",
          metadata: {
            bookingId: booking._id.toString(),
            bookingNumber: booking.bookingNumber,
            rejectionReason: reason || "Von Administrator abgelehnt",
          },
        });

        refundInfo = {
          refundId: refund.id,
          amount: refund.amount / 100, // Convert cents to euros
          status: refund.status,
          processedAt: new Date(),
        };

        // Update payment status
        booking.payment.status = "refunded";
        booking.payment.refund = refundInfo;

        console.log(`Refund processed for booking ${booking.bookingNumber}: €${refundInfo.amount}`);
      } catch (refundError) {
        console.error("Stripe refund error:", refundError);
        // Continue with rejection even if refund fails - admin can process manually
      }
    }

    booking.status = "cancelled";
    booking.cancellation = {
      isCancelled: true,
      cancelledAt: new Date(),
      cancelledBy: req.user._id,
      reason: reason || "Von Administrator abgelehnt",
      refundProcessed: refundInfo ? true : false,
      refundAmount: refundInfo?.amount || 0,
    };
    await booking.save();

    // Send rejection notification to user (optional, don't fail if it errors)
    try {
      const io = req.app.get("io");
      const notificationMessage = refundInfo
        ? `Ihre Buchung #${booking.bookingNumber} wurde abgelehnt. Eine Rückerstattung von €${refundInfo.amount.toFixed(2)} wurde verarbeitet.`
        : `Ihre Buchung #${booking.bookingNumber} wurde abgelehnt.`;

      if (io && createNotification) {
        await createNotification(
          {
            recipient: booking.user._id,
            sender: req.user._id,
            type: "booking_rejected",
            title: "Buchung abgelehnt",
            message: notificationMessage,
            relatedBooking: booking._id,
            actionUrl: `/dashboard/bookings/${booking._id}`,
            metadata: {
              bookingNumber: booking.bookingNumber,
              vehicleName: booking.vehicle.name,
              reason: reason || "Von Administrator abgelehnt",
              refundProcessed: refundInfo ? true : false,
              refundAmount: refundInfo?.amount || 0,
            },
          },
          io
        );
      }

      // Send email notification about rejection and refund
      if (refundInfo) {
        const sendEmail = require("../utils/sendEmail");
        try {
          await sendEmail({
            to: booking.user.email,
            subject: "Buchungsablehnung & Rückerstattung - WohnmobilTraum",
            html: `
              <h1>Buchung abgelehnt</h1>
              <p>Sehr geehrte/r ${booking.user.firstName} ${booking.user.lastName},</p>
              <p>Ihre Buchung <strong>#${booking.bookingNumber}</strong> wurde leider abgelehnt.</p>
              <h3>Ablehnungsgrund:</h3>
              <p>${reason || "Von Administrator abgelehnt"}</p>
              <h3>Rückerstattung:</h3>
              <p>Der Betrag von <strong>€${refundInfo.amount.toFixed(2)}</strong> wurde zurückerstattet.</p>
              <p>Die Rückerstattung wird in 5-10 Werktagen auf Ihrem Konto erscheinen.</p>
              <p>Bei Fragen stehen wir Ihnen gerne zur Verfügung.</p>
              <p>Mit freundlichen Grüßen,<br>Ihr WohnmobilTraum Team</p>
            `,
          });
        } catch (emailError) {
          console.error("Email error (non-critical):", emailError.message);
        }
      }
    } catch (notificationError) {
      console.error("Notification error (non-critical):", notificationError.message);
      // Continue anyway - notification failure shouldn't block rejection
    }

    res.json({
      success: true,
      message: refundInfo
        ? `Buchung abgelehnt und Rückerstattung von €${refundInfo.amount.toFixed(2)} verarbeitet`
        : "Buchung abgelehnt",
      data: booking,
      refund: refundInfo,
    });
  } catch (error) {
    console.error("Reject booking error:", error);
    console.error("Error stack:", error.stack);
    res.status(500).json({
      success: false,
      message: "Fehler bei der Buchungsablehnung",
      error: error.message,
    });
  }
};

module.exports = {
  getDashboardStats,
  getUsers,
  updateUser,
  deleteUser,
  createUser,
  getVehicles,
  getPendingVehicles,
  getPendingBookings,
  approveBooking,
  rejectBooking,
  uploadVehicleImage,
  createVehicle,
  updateVehicle,
  deleteVehicle,
  getAllBookings,
  verifyVehicle,
  getAnalytics,
  getSystemSettings,
};
