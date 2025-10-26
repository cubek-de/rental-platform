// api/routes/favorites.routes.js
const router = require("express").Router();
const favoritesController = require("../controllers/favorites.controller");
const { protect } = require("../middleware/auth.middleware");

// All routes require authentication
router.use(protect);

// Add vehicle to favorites
router.post("/add", favoritesController.addFavorite);

// Remove vehicle from favorites
router.delete("/remove/:vehicleId", favoritesController.removeFavorite);

// Get all user's favorites
router.get("/", favoritesController.getFavorites);

// Check if vehicle is favorite
router.get("/check/:vehicleId", favoritesController.checkFavorite);

module.exports = router;
