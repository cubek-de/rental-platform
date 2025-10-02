// backend/routes/auth.routes.js
const router = require("express").Router();
const { body, validationResult } = require("express-validator");
const authController = require("../controllers/auth.controller");
const { protect } = require("../middleware/auth.middleware");

// Validation rules
const registerValidation = [
  body("firstName")
    .trim()
    .notEmpty()
    .withMessage("Vorname ist erforderlich")
    .isLength({ min: 2, max: 50 })
    .withMessage("Vorname muss zwischen 2 und 50 Zeichen lang sein"),
  body("lastName")
    .trim()
    .notEmpty()
    .withMessage("Nachname ist erforderlich")
    .isLength({ min: 2, max: 50 })
    .withMessage("Nachname muss zwischen 2 und 50 Zeichen lang sein"),
  body("email")
    .isEmail()
    .withMessage("Ungültige E-Mail-Adresse")
    .normalizeEmail(),
  body("password")
    .isLength({ min: 8 })
    .withMessage("Passwort muss mindestens 8 Zeichen lang sein")
    .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/)
    .withMessage(
      "Passwort muss mindestens einen Großbuchstaben, einen Kleinbuchstaben, eine Zahl und ein Sonderzeichen enthalten"
    ),
  body("phone")
    .optional()
    .matches(
      /^[\+]?[(]?[0-9]{3}[)]?[-\s\.]?[(]?[0-9]{3}[)]?[-\s\.]?[0-9]{4,6}$/
    )
    .withMessage("Ungültige Telefonnummer"),
];

const loginValidation = [
  body("email")
    .isEmail()
    .withMessage("Ungültige E-Mail-Adresse")
    .normalizeEmail(),
  body("password").notEmpty().withMessage("Passwort ist erforderlich"),
];

// Routes
router.post("/register", registerValidation, authController.register);
router.post("/login", loginValidation, authController.login);
router.post("/logout", protect, authController.logout);
router.post("/refresh-token", authController.refreshToken);
router.get("/verify-email/:token", authController.verifyEmail);
router.post("/forgot-password", authController.forgotPassword);
router.post("/reset-password/:token", authController.resetPassword);
router.post("/change-password", protect, authController.changePassword);
router.post("/resend-verification", authController.resendVerification);
router.get("/me", protect, authController.getMe);
router.put("/update-profile", protect, authController.updateProfile);
router.post("/enable-2fa", protect, authController.enableTwoFactor);
router.post("/verify-2fa", protect, authController.verifyTwoFactor);
router.post("/disable-2fa", protect, authController.disableTwoFactor);

// Test email endpoint (for development)
if (process.env.NODE_ENV === "development") {
  router.post("/test-email", authController.testEmail);
}

module.exports = router;
