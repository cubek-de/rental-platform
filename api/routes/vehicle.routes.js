// backend/routes/vehicle.routes.js
const router = require("express").Router();
const { body } = require("express-validator");
const vehicleController = require("../controllers/vehicle.controller");
const { protect, authorize } = require("../middleware/auth.middleware");
const { uploadImages } = require("../middleware/upload.middleware");

// Validation
const vehicleValidation = [
  body("name").notEmpty().withMessage("Fahrzeugname ist erforderlich"),
  body("category")
    .isIn(["Wohnmobil", "Wohnwagen", "Kastenwagen"])
    .withMessage("Ungültige Kategorie"),
  body("technicalData.brand").notEmpty().withMessage("Marke ist erforderlich"),
  body("technicalData.model").notEmpty().withMessage("Modell ist erforderlich"),
  body("technicalData.year")
    .isInt({ min: 1990 })
    .withMessage("Ungültiges Baujahr"),
  body("capacity.seats")
    .isInt({ min: 1, max: 10 })
    .withMessage("Ungültige Sitzplatzanzahl"),
  body("capacity.sleepingPlaces")
    .isInt({ min: 1, max: 8 })
    .withMessage("Ungültige Schlafplatzanzahl"),
  body("pricing.basePrice.perDay")
    .isFloat({ min: 0 })
    .withMessage("Ungültiger Preis"),
  body("pricing.deposit").isFloat({ min: 0 }).withMessage("Ungültige Kaution"),
];

// Public routes
router.get("/", vehicleController.getVehicles);
router.get("/:slug", vehicleController.getVehicle);
router.get("/:id/availability", vehicleController.checkAvailability);

// Protected routes
router.use(protect);

// Agent/Admin routes
router.post(
  "/",
  authorize("agent", "admin"),
  uploadImages,
  vehicleValidation,
  vehicleController.createVehicle
);

router.put(
  "/:id",
  authorize("agent", "admin"),
  uploadImages,
  vehicleController.updateVehicle
);

router.delete(
  "/:id",
  authorize("agent", "admin"),
  vehicleController.deleteVehicle
);

module.exports = router;
