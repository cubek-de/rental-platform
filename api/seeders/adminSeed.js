const mongoose = require("mongoose");
const dotenv = require("dotenv");
const User = require("../models/User.model");

dotenv.config();

const createAdmin = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log("✅ Connected to MongoDB");

    // Check if admin already exists - if so, delete it to recreate with correct password
    const existingAdmin = await User.findOne({ email: "admin@wohnmobiltraum.com" });
    if (existingAdmin) {
      console.log("⚠️  Admin user already exists - deleting and recreating...");
      await User.deleteOne({ email: "admin@wohnmobiltraum.com" });
    }

    // Create admin user - let the model's pre-save hook hash the password
    const admin = await User.create({
      firstName: "Admin",
      lastName: "WohnmobilTraum",
      email: "admin@wohnmobiltraum.com",
      password: "Admin123!",
      role: "admin",
      security: {
        emailVerified: true,
      },
      permissions: {
        canManageUsers: true,
        canManageVehicles: true,
        canManageBookings: true,
        canManagePayments: true,
        canViewAnalytics: true,
        canManageSettings: true,
        canCreateVehicle: true,
        canEditVehicle: true,
        canDeleteVehicle: true,
        canApproveVehicles: true,
      },
      profile: {
        phone: "01234567890",
        address: {
          street: "Hauptstraße 1",
          city: "München",
          state: "Bayern",
          postalCode: "80331",
          country: "Deutschland",
        },
      },
    });

    console.log("\n🎉 Admin user created successfully!");
    console.log("\n📋 Admin Credentials:");
    console.log("   Email:    admin@wohnmobiltraum.com");
    console.log("   Password: Admin123!");
    console.log("\n🔐 Login at: http://localhost:5173/login");
    console.log("\n✅ All permissions granted!");

    process.exit(0);
  } catch (error) {
    console.error("❌ Error creating admin:", error);
    process.exit(1);
  }
};

createAdmin();
