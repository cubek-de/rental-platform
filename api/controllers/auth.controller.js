// backend/controllers/auth.controller.js
const User = require("../models/User.model");
const { validationResult } = require("express-validator");
const sendEmail = require("../utils/sendEmail");
const crypto = require("crypto");
const jwt = require("jsonwebtoken");

// Register user
const register = async (req, res) => {
  try {
    // Check for validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: "Validierungsfehler",
        errors: errors.array(),
      });
    }

    const { firstName, lastName, email, password, phone } = req.body;

    // Check if user already exists
    const existingUser = await User.findOne({ email: email.toLowerCase() });
    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: "Benutzer mit dieser E-Mail-Adresse existiert bereits",
      });
    }

    // Create user
    const user = await User.create({
      firstName,
      lastName,
      email: email.toLowerCase(),
      password,
      "profile.phone": phone,
    });

    // Generate email verification token
    const verificationToken = user.generateEmailVerificationToken();
    await user.save();

    // Send verification email
    try {
      await sendEmail({
        to: user.email,
        subject: "E-Mail-Verifizierung - WohnmobilTraum",
        template: "emailVerification",
        data: {
          firstName: user.firstName,
          verificationUrl: `${process.env.FRONTEND_URL}/verify-email/${verificationToken}`,
        },
      });
    } catch (emailError) {
      console.error("Email send error:", emailError);
      // Don't fail registration if email fails
    }

    // Generate tokens
    const token = user.generateAuthToken();
    const refreshToken = user.generateRefreshToken();
    await user.save();

    // Remove password from response
    user.password = undefined;

    res.status(201).json({
      success: true,
      message:
        "Benutzer erfolgreich registriert. Bitte überprüfen Sie Ihre E-Mail zur Verifizierung.",
      data: {
        user,
        token,
        refreshToken,
      },
    });
  } catch (error) {
    console.error("Register error:", error);
    res.status(500).json({
      success: false,
      message: "Registrierungsfehler",
    });
  }
};

// Login user
const login = async (req, res) => {
  try {
    // Check for validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: "Validierungsfehler",
        errors: errors.array(),
      });
    }

    const { email, password } = req.body;

    // Find user and include password for comparison
    const user = await User.findOne({ email: email.toLowerCase() }).select(
      "+password"
    );

    if (!user) {
      return res.status(401).json({
        success: false,
        message: "Ungültige Anmeldedaten",
      });
    }

    // Check if account is locked
    if (user.isLocked()) {
      return res.status(423).json({
        success: false,
        message:
          "Konto ist vorübergehend gesperrt aufgrund zu vieler fehlgeschlagener Anmeldungen",
      });
    }

    // Check password
    const isPasswordValid = await user.comparePassword(password);
    if (!isPasswordValid) {
      await user.incLoginAttempts();
      return res.status(401).json({
        success: false,
        message: "Ungültige Anmeldedaten",
      });
    }

    // Reset login attempts on successful login
    await user.resetLoginAttempts();

    // Update last login
    user.security.lastLogin = new Date();
    user.security.lastLoginIp = req.ip;

    // Generate tokens
    const token = user.generateAuthToken();
    const refreshToken = user.generateRefreshToken();
    await user.save();

    // Remove password from response
    user.password = undefined;

    res.json({
      success: true,
      message: "Anmeldung erfolgreich",
      data: {
        user,
        token,
        refreshToken,
      },
    });
  } catch (error) {
    console.error("Login error:", error);
    res.status(500).json({
      success: false,
      message: "Anmeldungsfehler",
    });
  }
};

// Logout user
const logout = async (req, res) => {
  try {
    // Remove session from user
    const user = req.user;
    user.security.sessions = user.security.sessions.filter(
      (session) => session.token !== req.headers.authorization?.split(" ")[1]
    );
    await user.save();

    res.json({
      success: true,
      message: "Abmeldung erfolgreich",
    });
  } catch (error) {
    console.error("Logout error:", error);
    res.status(500).json({
      success: false,
      message: "Abmeldungsfehler",
    });
  }
};

// Refresh token
const refreshToken = async (req, res) => {
  try {
    const { refreshToken } = req.body;

    if (!refreshToken) {
      return res.status(400).json({
        success: false,
        message: "Refresh-Token erforderlich",
      });
    }

    // Verify refresh token
    const decoded = jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET);

    // Find user
    const user = await User.findById(decoded.id);
    if (!user) {
      return res.status(401).json({
        success: false,
        message: "Ungültiger Refresh-Token",
      });
    }

    // Check if refresh token exists in user's sessions
    const session = user.security.sessions.find(
      (s) => s.token === refreshToken && s.expiresAt > new Date()
    );

    if (!session) {
      return res.status(401).json({
        success: false,
        message: "Ungültiger oder abgelaufener Refresh-Token",
      });
    }

    // Generate new tokens
    const newToken = user.generateAuthToken();
    const newRefreshToken = user.generateRefreshToken();
    await user.save();

    res.json({
      success: true,
      data: {
        token: newToken,
        refreshToken: newRefreshToken,
      },
    });
  } catch (error) {
    console.error("Refresh token error:", error);
    res.status(401).json({
      success: false,
      message: "Ungültiger Refresh-Token",
    });
  }
};

// Verify email
const verifyEmail = async (req, res) => {
  try {
    const { token } = req.params;

    // Hash the token
    const hashedToken = crypto.createHash("sha256").update(token).digest("hex");

    // Find user with matching token
    const user = await User.findOne({
      "security.emailVerificationToken": hashedToken,
      "security.emailVerificationExpires": { $gt: Date.now() },
    });

    if (!user) {
      return res.status(400).json({
        success: false,
        message: "Ungültiger oder abgelaufener Verifizierungstoken",
      });
    }

    // Update user
    user.security.emailVerified = true;
    user.security.emailVerificationToken = undefined;
    user.security.emailVerificationExpires = undefined;
    await user.save();

    res.json({
      success: true,
      message: "E-Mail erfolgreich verifiziert",
    });
  } catch (error) {
    console.error("Verify email error:", error);
    res.status(500).json({
      success: false,
      message: "E-Mail-Verifizierungsfehler",
    });
  }
};

// Forgot password
const forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;

    const user = await User.findOne({ email: email.toLowerCase() });
    if (!user) {
      // Don't reveal if email exists
      return res.json({
        success: true,
        message:
          "Wenn ein Konto mit dieser E-Mail-Adresse existiert, wurde eine E-Mail gesendet",
      });
    }

    // Generate reset token
    const resetToken = user.generatePasswordResetToken();
    await user.save();

    // Send reset email
    try {
      await sendEmail({
        to: user.email,
        subject: "Passwort zurücksetzen - WohnmobilTraum",
        template: "passwordReset",
        data: {
          firstName: user.firstName,
          resetUrl: `${process.env.FRONTEND_URL}/reset-password/${resetToken}`,
        },
      });
    } catch (emailError) {
      console.error("Email send error:", emailError);
      user.security.passwordResetToken = undefined;
      user.security.passwordResetExpires = undefined;
      await user.save();
      return res.status(500).json({
        success: false,
        message: "Fehler beim Senden der E-Mail",
      });
    }

    res.json({
      success: true,
      message:
        "Wenn ein Konto mit dieser E-Mail-Adresse existiert, wurde eine E-Mail gesendet",
    });
  } catch (error) {
    console.error("Forgot password error:", error);
    res.status(500).json({
      success: false,
      message: "Fehler beim Zurücksetzen des Passworts",
    });
  }
};

// Reset password
const resetPassword = async (req, res) => {
  try {
    const { token } = req.params;
    const { password } = req.body;

    // Hash the token
    const hashedToken = crypto.createHash("sha256").update(token).digest("hex");

    // Find user with matching token
    const user = await User.findOne({
      "security.passwordResetToken": hashedToken,
      "security.passwordResetExpires": { $gt: Date.now() },
    }).select("+password");

    if (!user) {
      return res.status(400).json({
        success: false,
        message: "Ungültiger oder abgelaufener Reset-Token",
      });
    }

    // Update password
    user.password = password;
    user.security.passwordResetToken = undefined;
    user.security.passwordResetExpires = undefined;
    await user.save();

    res.json({
      success: true,
      message: "Passwort erfolgreich zurückgesetzt",
    });
  } catch (error) {
    console.error("Reset password error:", error);
    res.status(500).json({
      success: false,
      message: "Fehler beim Zurücksetzen des Passworts",
    });
  }
};

// Change password
const changePassword = async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;
    const user = await User.findById(req.user._id).select("+password");

    // Check current password
    const isCurrentPasswordValid = await user.comparePassword(currentPassword);
    if (!isCurrentPasswordValid) {
      return res.status(400).json({
        success: false,
        message: "Aktuelles Passwort ist falsch",
      });
    }

    // Update password
    user.password = newPassword;
    await user.save();

    res.json({
      success: true,
      message: "Passwort erfolgreich geändert",
    });
  } catch (error) {
    console.error("Change password error:", error);
    res.status(500).json({
      success: false,
      message: "Fehler beim Ändern des Passworts",
    });
  }
};

// Resend verification
const resendVerification = async (req, res) => {
  try {
    const { email } = req.body;

    const user = await User.findOne({ email: email.toLowerCase() });
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "Benutzer nicht gefunden",
      });
    }

    if (user.security.emailVerified) {
      return res.status(400).json({
        success: false,
        message: "E-Mail ist bereits verifiziert",
      });
    }

    // Generate new verification token
    const verificationToken = user.generateEmailVerificationToken();
    await user.save();

    // Send verification email
    try {
      await sendEmail({
        to: user.email,
        subject: "E-Mail-Verifizierung - WohnmobilTraum",
        template: "emailVerification",
        data: {
          firstName: user.firstName,
          verificationUrl: `${process.env.FRONTEND_URL}/verify-email/${verificationToken}`,
        },
      });
    } catch (emailError) {
      console.error("Email send error:", emailError);
      return res.status(500).json({
        success: false,
        message: "Fehler beim Senden der E-Mail",
      });
    }

    res.json({
      success: true,
      message: "Verifizierungs-E-Mail wurde erneut gesendet",
    });
  } catch (error) {
    console.error("Resend verification error:", error);
    res.status(500).json({
      success: false,
      message: "Fehler beim erneuten Senden der Verifizierung",
    });
  }
};

// Get current user
const getMe = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);

    res.json({
      success: true,
      data: { user },
    });
  } catch (error) {
    console.error("Get me error:", error);
    res.status(500).json({
      success: false,
      message: "Fehler beim Abrufen der Benutzerdaten",
    });
  }
};

// Update profile
const updateProfile = async (req, res) => {
  try {
    const allowedFields = [
      "firstName",
      "lastName",
      "profile.phone",
      "profile.address",
      "profile.dateOfBirth",
      "profile.drivingLicense",
      "profile.language",
      "preferences",
    ];

    const updates = {};
    allowedFields.forEach((field) => {
      if (req.body[field] !== undefined) {
        updates[field] = req.body[field];
      }
    });

    const user = await User.findByIdAndUpdate(req.user._id, updates, {
      new: true,
      runValidators: true,
    });

    res.json({
      success: true,
      message: "Profil erfolgreich aktualisiert",
      data: { user },
    });
  } catch (error) {
    console.error("Update profile error:", error);
    res.status(500).json({
      success: false,
      message: "Fehler beim Aktualisieren des Profils",
    });
  }
};

// Enable 2FA
const enableTwoFactor = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);

    // Generate 2FA secret
    const secret = crypto.randomBytes(32).toString("hex");
    user.security.twoFactorSecret = secret;
    user.security.twoFactorEnabled = true;
    await user.save();

    res.json({
      success: true,
      message: "Zwei-Faktor-Authentifizierung aktiviert",
      data: {
        secret,
        // In production, you'd generate a QR code here
      },
    });
  } catch (error) {
    console.error("Enable 2FA error:", error);
    res.status(500).json({
      success: false,
      message: "Fehler beim Aktivieren der Zwei-Faktor-Authentifizierung",
    });
  }
};

// Verify 2FA
const verifyTwoFactor = async (req, res) => {
  try {
    const { code } = req.body;
    const user = await User.findById(req.user._id);

    if (!user.security.twoFactorEnabled) {
      return res.status(400).json({
        success: false,
        message: "Zwei-Faktor-Authentifizierung ist nicht aktiviert",
      });
    }

    // Simple verification - in production use proper TOTP
    const expectedCode = user.security.twoFactorSecret.substring(0, 6);
    if (code !== expectedCode) {
      return res.status(400).json({
        success: false,
        message: "Ungültiger Code",
      });
    }

    res.json({
      success: true,
      message: "Code verifiziert",
    });
  } catch (error) {
    console.error("Verify 2FA error:", error);
    res.status(500).json({
      success: false,
      message: "Fehler bei der Verifizierung",
    });
  }
};

// Disable 2FA
const disableTwoFactor = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);

    user.security.twoFactorEnabled = false;
    user.security.twoFactorSecret = undefined;
    await user.save();

    res.json({
      success: true,
      message: "Zwei-Faktor-Authentifizierung deaktiviert",
    });
  } catch (error) {
    console.error("Disable 2FA error:", error);
    res.status(500).json({
      success: false,
      message: "Fehler beim Deaktivieren der Zwei-Faktor-Authentifizierung",
    });
  }
};

// Test email functionality (development only)
const testEmail = async (req, res) => {
  try {
    if (process.env.NODE_ENV !== "development") {
      return res.status(403).json({
        success: false,
        message: "Test email endpoint is only available in development mode",
      });
    }

    const { email } = req.body;
    if (!email) {
      return res.status(400).json({
        success: false,
        message: "Email address is required",
      });
    }

    const result = await sendEmail({
      to: email,
      subject: "Test Email - WohnmobilTraum",
      template: "emailVerification",
      data: {
        firstName: "Test User",
        verificationUrl: `${process.env.FRONTEND_URL}/verify-email/test-token`,
      },
    });

    res.status(200).json({
      success: true,
      message: "Test email sent successfully",
      result,
    });
  } catch (error) {
    console.error("Test email error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to send test email",
      error: error.message,
    });
  }
};

module.exports = {
  register,
  login,
  logout,
  refreshToken,
  verifyEmail,
  forgotPassword,
  resetPassword,
  changePassword,
  resendVerification,
  getMe,
  updateProfile,
  enableTwoFactor,
  verifyTwoFactor,
  disableTwoFactor,
  testEmail,
};
