// backend/models/User.model.js
const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const crypto = require("crypto");

const userSchema = new mongoose.Schema(
  {
    firstName: {
      type: String,
      required: [true, "Vorname ist erforderlich"],
      trim: true,
      maxlength: [50, "Vorname darf maximal 50 Zeichen lang sein"],
    },
    lastName: {
      type: String,
      required: [true, "Nachname ist erforderlich"],
      trim: true,
      maxlength: [50, "Nachname darf maximal 50 Zeichen lang sein"],
    },
    email: {
      type: String,
      required: [true, "E-Mail ist erforderlich"],
      unique: true,
      lowercase: true,
      match: [
        /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/,
        "Bitte geben Sie eine gültige E-Mail-Adresse ein",
      ],
    },
    password: {
      type: String,
      required: [true, "Passwort ist erforderlich"],
      minlength: [8, "Passwort muss mindestens 8 Zeichen lang sein"],
      select: false,
      validate: {
        validator: function (password) {
          // Strong password validation
          return /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/.test(
            password
          );
        },
        message:
          "Passwort muss mindestens einen Großbuchstaben, einen Kleinbuchstaben, eine Zahl und ein Sonderzeichen enthalten",
      },
    },
    role: {
      type: String,
      enum: ["user", "agent", "admin"],
      default: "user",
    },
    permissions: {
      canCreateVehicle: { type: Boolean, default: false },
      canEditVehicle: { type: Boolean, default: false },
      canDeleteVehicle: { type: Boolean, default: false },
      canManageBookings: { type: Boolean, default: false },
      canManageUsers: { type: Boolean, default: false },
      canViewAnalytics: { type: Boolean, default: false },
      canManagePayments: { type: Boolean, default: false },
    },
    profile: {
      phone: {
        type: String,
        match: [
          /^[\+]?[(]?[0-9]{3}[)]?[-\s\.]?[(]?[0-9]{3}[)]?[-\s\.]?[0-9]{4,6}$/,
          "Bitte geben Sie eine gültige Telefonnummer ein",
        ],
      },
      address: {
        street: String,
        city: String,
        state: String,
        postalCode: String,
        country: { type: String, default: "Deutschland" },
      },
      dateOfBirth: Date,
      drivingLicense: {
        number: String,
        issuedDate: Date,
        expiryDate: Date,
        verified: { type: Boolean, default: false },
      },
      avatar: String,
      language: { type: String, default: "de" },
    },
    security: {
      emailVerified: { type: Boolean, default: false },
      emailVerificationToken: String,
      emailVerificationExpires: Date,
      passwordResetToken: String,
      passwordResetExpires: Date,
      passwordChangedAt: Date,
      twoFactorEnabled: { type: Boolean, default: false },
      twoFactorSecret: String,
      loginAttempts: { type: Number, default: 0 },
      lockUntil: Date,
      lastLogin: Date,
      lastLoginIp: String,
      trustedDevices: [
        {
          deviceId: String,
          userAgent: String,
          addedAt: Date,
        },
      ],
      sessions: [
        {
          token: String,
          deviceInfo: String,
          ip: String,
          createdAt: Date,
          expiresAt: Date,
        },
      ],
    },
    stripeCustomerId: String,
    agentProfile: {
      companyName: String,
      businessRegistration: String,
      vatNumber: String,
      commission: { type: Number, default: 15 },
      verified: { type: Boolean, default: false },
      vehicles: [
        {
          type: mongoose.Schema.Types.ObjectId,
          ref: "Vehicle",
        },
      ],
    },
    preferences: {
      newsletter: { type: Boolean, default: true },
      smsNotifications: { type: Boolean, default: false },
      emailNotifications: { type: Boolean, default: true },
    },
    status: {
      type: String,
      enum: ["active", "inactive", "suspended", "deleted"],
      default: "active",
    },
  },
  {
    timestamps: true,
  }
);

// Indexes for performance
userSchema.index({ email: 1, role: 1 });
userSchema.index({ "security.emailVerified": 1 });
userSchema.index({ createdAt: -1 });

// Virtual for full name
userSchema.virtual("fullName").get(function () {
  return `${this.firstName} ${this.lastName}`;
});

// Encrypt password before saving
userSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next();

  try {
    const salt = await bcrypt.genSalt(12);
    this.password = await bcrypt.hash(this.password, salt);
    this.security.passwordChangedAt = Date.now() - 1000;
    next();
  } catch (error) {
    next(error);
  }
});

// Update permissions based on role
userSchema.pre("save", function (next) {
  if (this.isModified("role")) {
    switch (this.role) {
      case "admin":
        this.permissions = {
          canCreateVehicle: true,
          canEditVehicle: true,
          canDeleteVehicle: true,
          canManageBookings: true,
          canManageUsers: true,
          canViewAnalytics: true,
          canManagePayments: true,
        };
        break;
      case "agent":
        this.permissions = {
          canCreateVehicle: true,
          canEditVehicle: true,
          canDeleteVehicle: false,
          canManageBookings: true,
          canManageUsers: false,
          canViewAnalytics: true,
          canManagePayments: false,
        };
        break;
      default:
        this.permissions = {
          canCreateVehicle: false,
          canEditVehicle: false,
          canDeleteVehicle: false,
          canManageBookings: false,
          canManageUsers: false,
          canViewAnalytics: false,
          canManagePayments: false,
        };
    }
  }
  next();
});

// Check if password is correct
userSchema.methods.comparePassword = async function (candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.password);
};

// Generate JWT token
userSchema.methods.generateAuthToken = function () {
  return jwt.sign(
    {
      id: this._id,
      email: this.email,
      role: this.role,
      permissions: this.permissions,
    },
    process.env.JWT_SECRET,
    {
      expiresIn: process.env.JWT_EXPIRE,
      issuer: "wohnmobil-rental",
      audience: "wohnmobil-users",
    }
  );
};

// Generate refresh token
userSchema.methods.generateRefreshToken = function () {
  const refreshToken = jwt.sign(
    { id: this._id },
    process.env.JWT_REFRESH_SECRET,
    { expiresIn: process.env.JWT_REFRESH_EXPIRE }
  );

  // Store session
  this.security.sessions.push({
    token: refreshToken,
    createdAt: new Date(),
    expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days
  });

  return refreshToken;
};

// Generate email verification token
userSchema.methods.generateEmailVerificationToken = function () {
  const verificationToken = crypto.randomBytes(32).toString("hex");
  this.security.emailVerificationToken = crypto
    .createHash("sha256")
    .update(verificationToken)
    .digest("hex");
  this.security.emailVerificationExpires = Date.now() + 24 * 60 * 60 * 1000; // 24 hours
  return verificationToken;
};

// Generate password reset token
userSchema.methods.generatePasswordResetToken = function () {
  const resetToken = crypto.randomBytes(32).toString("hex");
  this.security.passwordResetToken = crypto
    .createHash("sha256")
    .update(resetToken)
    .digest("hex");
  this.security.passwordResetExpires = Date.now() + 60 * 60 * 1000; // 1 hour
  return resetToken;
};

// Check if user is locked
userSchema.methods.isLocked = function () {
  return !!(this.security.lockUntil && this.security.lockUntil > Date.now());
};

// Increment login attempts
userSchema.methods.incLoginAttempts = async function () {
  // Reset attempts if lock has expired
  if (this.security.lockUntil && this.security.lockUntil < Date.now()) {
    return this.updateOne({
      $set: { "security.loginAttempts": 1 },
      $unset: { "security.lockUntil": 1 },
    });
  }

  const updates = { $inc: { "security.loginAttempts": 1 } };
  const maxAttempts = 5;
  const lockTime = 2 * 60 * 60 * 1000; // 2 hours

  if (this.security.loginAttempts + 1 >= maxAttempts && !this.isLocked()) {
    updates.$set = { "security.lockUntil": Date.now() + lockTime };
  }

  return this.updateOne(updates);
};

// Reset login attempts
userSchema.methods.resetLoginAttempts = async function () {
  return this.updateOne({
    $set: { "security.loginAttempts": 0 },
    $unset: { "security.lockUntil": 1 },
  });
};

module.exports = mongoose.model("User", userSchema);
