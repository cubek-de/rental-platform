// api/controllers/favorites.controller.js
const User = require("../models/User.model");
const Vehicle = require("../models/Vehicle.model");

/**
 * Add vehicle to user's favorites
 * @route POST /api/favorites/add
 */
exports.addFavorite = async (req, res) => {
  try {
    const { vehicleId } = req.body;

    if (!vehicleId) {
      return res.status(400).json({
        success: false,
        message: "Fahrzeug-ID ist erforderlich",
      });
    }

    // Check if vehicle exists
    const vehicle = await Vehicle.findById(vehicleId);
    if (!vehicle) {
      return res.status(404).json({
        success: false,
        message: "Fahrzeug nicht gefunden",
      });
    }

    // Check if already in favorites
    const user = await User.findById(req.user._id);
    if (user.favorites.includes(vehicleId)) {
      return res.status(400).json({
        success: false,
        message: "Fahrzeug ist bereits in Favoriten",
      });
    }

    // Add to favorites
    user.favorites.push(vehicleId);
    await user.save();

    res.status(200).json({
      success: true,
      message: "Fahrzeug zu Favoriten hinzugefügt",
      data: {
        favorites: user.favorites,
      },
    });
  } catch (error) {
    console.error("Error adding favorite:", error);
    res.status(500).json({
      success: false,
      message: "Fehler beim Hinzufügen zu Favoriten",
      error: error.message,
    });
  }
};

/**
 * Remove vehicle from user's favorites
 * @route DELETE /api/favorites/remove/:vehicleId
 */
exports.removeFavorite = async (req, res) => {
  try {
    const { vehicleId } = req.params;

    if (!vehicleId) {
      return res.status(400).json({
        success: false,
        message: "Fahrzeug-ID ist erforderlich",
      });
    }

    const user = await User.findById(req.user._id);

    // Check if vehicle is in favorites
    if (!user.favorites.includes(vehicleId)) {
      return res.status(400).json({
        success: false,
        message: "Fahrzeug ist nicht in Favoriten",
      });
    }

    // Remove from favorites
    user.favorites = user.favorites.filter(
      (id) => id.toString() !== vehicleId
    );
    await user.save();

    res.status(200).json({
      success: true,
      message: "Fahrzeug aus Favoriten entfernt",
      data: {
        favorites: user.favorites,
      },
    });
  } catch (error) {
    console.error("Error removing favorite:", error);
    res.status(500).json({
      success: false,
      message: "Fehler beim Entfernen aus Favoriten",
      error: error.message,
    });
  }
};

/**
 * Get all user's favorite vehicles
 * @route GET /api/favorites
 */
exports.getFavorites = async (req, res) => {
  try {
    const user = await User.findById(req.user._id).populate({
      path: "favorites",
      select: "-__v",
      populate: {
        path: "owner",
        select: "firstName lastName email profile.companyName",
      },
    });

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "Benutzer nicht gefunden",
      });
    }

    res.status(200).json({
      success: true,
      count: user.favorites.length,
      data: {
        favorites: user.favorites,
      },
    });
  } catch (error) {
    console.error("Error getting favorites:", error);
    res.status(500).json({
      success: false,
      message: "Fehler beim Abrufen der Favoriten",
      error: error.message,
    });
  }
};

/**
 * Check if vehicle is in user's favorites
 * @route GET /api/favorites/check/:vehicleId
 */
exports.checkFavorite = async (req, res) => {
  try {
    const { vehicleId } = req.params;

    const user = await User.findById(req.user._id);
    const isFavorite = user.favorites.includes(vehicleId);

    res.status(200).json({
      success: true,
      data: {
        isFavorite,
      },
    });
  } catch (error) {
    console.error("Error checking favorite:", error);
    res.status(500).json({
      success: false,
      message: "Fehler beim Überprüfen des Favoriten",
      error: error.message,
    });
  }
};
