// backend/controllers/agent.controller.js
const Vehicle = require("../models/Vehicle.model");
const Booking = require("../models/Booking.model");
const User = require("../models/User.model");

// Get agent dashboard
const getDashboard = async (req, res) => {
  try {
    const agentId = req.user._id;

    // Get agent's vehicles
    const vehicles = await Vehicle.find({ owner: agentId });
    const vehicleIds = vehicles.map((v) => v._id);

    // Calculate statistics
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const thisMonth = new Date();
    thisMonth.setDate(1);
    thisMonth.setHours(0, 0, 0, 0);

    const [
      totalVehicles,
      activeBookings,
      todayBookings,
      monthlyRevenue,
      pendingBookings,
      recentBookings,
    ] = await Promise.all([
      Vehicle.countDocuments({ owner: agentId, status: "aktiv" }),

      Booking.countDocuments({
        vehicle: { $in: vehicleIds },
        status: "active",
      }),

      Booking.countDocuments({
        vehicle: { $in: vehicleIds },
        createdAt: { $gte: today },
      }),

      Booking.aggregate([
        {
          $match: {
            vehicle: { $in: vehicleIds },
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

      Booking.countDocuments({
        vehicle: { $in: vehicleIds },
        status: "pending",
      }),

      Booking.find({ vehicle: { $in: vehicleIds } })
        .populate("user", "firstName lastName email")
        .populate("vehicle", "name")
        .sort({ createdAt: -1 })
        .limit(10)
        .lean(),
    ]);

    // Calculate commission
    const revenue = monthlyRevenue[0]?.total || 0;
    const commission = revenue * (req.user.agentProfile.commission / 100);
    const netRevenue = revenue - commission;

    res.json({
      success: true,
      data: {
        overview: {
          totalVehicles,
          activeBookings,
          todayBookings,
          pendingBookings,
        },
        revenue: {
          gross: revenue,
          commission,
          net: netRevenue,
        },
        recentBookings,
      },
    });
  } catch (error) {
    console.error("Get agent dashboard error:", error);
    res.status(500).json({
      success: false,
      message: "Fehler beim Abrufen des Dashboards",
    });
  }
};

// Get agent's vehicles
const getMyVehicles = async (req, res) => {
  try {
    const {
      status,
      sortBy = "createdAt",
      order = "desc",
      page = 1,
      limit = 10,
    } = req.query;

    const query = { owner: req.user._id };
    if (status) query.status = status;

    const skip = (page - 1) * limit;
    const sort = { [sortBy]: order === "desc" ? -1 : 1 };

    const [vehicles, total] = await Promise.all([
      Vehicle.find(query).sort(sort).skip(skip).limit(Number(limit)).lean(),
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
    console.error("Get agent vehicles error:", error);
    res.status(500).json({
      success: false,
      message: "Fehler beim Abrufen der Fahrzeuge",
    });
  }
};

// Get bookings for agent's vehicles
const getMyBookings = async (req, res) => {
  try {
    const vehicles = await Vehicle.find({ owner: req.user._id }).select("_id");
    const vehicleIds = vehicles.map((v) => v._id);

    const {
      status,
      vehicleId,
      dateFrom,
      dateTo,
      sortBy = "createdAt",
      order = "desc",
      page = 1,
      limit = 10,
    } = req.query;

    const query = { vehicle: { $in: vehicleIds } };

    if (status) query.status = status;
    if (vehicleId && vehicleIds.includes(vehicleId)) query.vehicle = vehicleId;

    if (dateFrom || dateTo) {
      query["dates.start"] = {};
      if (dateFrom) query["dates.start"].$gte = new Date(dateFrom);
      if (dateTo) query["dates.start"].$lte = new Date(dateTo);
    }

    const skip = (page - 1) * limit;
    const sort = { [sortBy]: order === "desc" ? -1 : 1 };

    const [bookings, total] = await Promise.all([
      Booking.find(query)
        .populate("user", "firstName lastName email profile.phone")
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
    console.error("Get agent bookings error:", error);
    res.status(500).json({
      success: false,
      message: "Fehler beim Abrufen der Buchungen",
    });
  }
};

// Get agent analytics
const getAgentAnalytics = async (req, res) => {
  try {
    const { period = "30d" } = req.query;
    const vehicles = await Vehicle.find({ owner: req.user._id }).select("_id");
    const vehicleIds = vehicles.map((v) => v._id);

    let startDate = new Date();
    switch (period) {
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

    // Revenue over time
    const revenueData = await Booking.aggregate([
      {
        $match: {
          vehicle: { $in: vehicleIds },
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

    // Vehicle performance
    const vehiclePerformance = await Booking.aggregate([
      {
        $match: {
          vehicle: { $in: vehicleIds },
          createdAt: { $gte: startDate },
        },
      },
      {
        $group: {
          _id: "$vehicle",
          revenue: { $sum: "$pricing.totalAmount" },
          bookings: { $sum: 1 },
          avgBookingValue: { $avg: "$pricing.totalAmount" },
        },
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
          revenue: 1,
          bookings: 1,
          avgBookingValue: 1,
        },
      },
    ]);

    // Occupancy rate
    const occupancyData = await Promise.all(
      vehicleIds.map(async (vehicleId) => {
        const vehicle = await Vehicle.findById(vehicleId).select("name");
        const totalDays = Math.ceil(
          (new Date() - startDate) / (1000 * 60 * 60 * 24)
        );

        const bookedDays = await Booking.aggregate([
          {
            $match: {
              vehicle: vehicleId,
              "dates.start": { $gte: startDate },
              status: { $in: ["confirmed", "active", "completed"] },
            },
          },
          {
            $project: {
              days: {
                $divide: [
                  { $subtract: ["$dates.end", "$dates.start"] },
                  1000 * 60 * 60 * 24,
                ],
              },
            },
          },
          {
            $group: {
              _id: null,
              totalBookedDays: { $sum: "$days" },
            },
          },
        ]);

        const occupancyRate = bookedDays[0]
          ? ((bookedDays[0].totalBookedDays / totalDays) * 100).toFixed(2)
          : 0;

        return {
          vehicleName: vehicle.name,
          occupancyRate: parseFloat(occupancyRate),
        };
      })
    );

    res.json({
      success: true,
      data: {
        revenue: revenueData,
        vehiclePerformance,
        occupancyData,
        period,
      },
    });
  } catch (error) {
    console.error("Get agent analytics error:", error);
    res.status(500).json({
      success: false,
      message: "Fehler beim Abrufen der Analytikdaten",
    });
  }
};

module.exports = {
  getDashboard,
  getMyVehicles,
  getMyBookings,
  getAgentAnalytics,
};
