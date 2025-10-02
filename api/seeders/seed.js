// backend/seeders/seed.js
const mongoose = require("mongoose");
const User = require("../models/User.model");
const Vehicle = require("../models/Vehicle.model");
require("dotenv").config();

const seedDatabase = async () => {
  try {
    // Connect to database
    await mongoose.connect(process.env.MONGO_URI);
    console.log("Connected to MongoDB");

    // Clear existing data
    await User.deleteMany({});
    await Vehicle.deleteMany({});
    console.log("Cleared existing data");

    // Create admin user
    const admin = await User.create({
      firstName: "Admin",
      lastName: "WohnmobilTraum",
      email: process.env.ADMIN_EMAIL,
      password: process.env.ADMIN_PASSWORD, // Use plain password, let model hash it
      role: "admin",
      status: "active",
      security: {
        emailVerified: true,
        emailVerifiedAt: new Date(),
      },
      profile: {
        phone: "+49301234567",
        address: {
          street: "Hauptstraße 1",
          city: "Berlin",
          state: "Berlin",
          postalCode: "10115",
          country: "Deutschland",
        },
      },
    });
    console.log("Created admin user");

    // Create agent users
    const agents = await User.create([
      {
        firstName: "Max",
        lastName: "Mustermann",
        email: "agent1@wohnmobiltraum.de",
        password: "Agent@1234", // Use plain password, let model hash it
        role: "agent",
        status: "active",
        security: {
          emailVerified: true,
          emailVerifiedAt: new Date(),
        },
        agentProfile: {
          companyName: "Camping Dreams GmbH",
          taxNumber: "DE123456789",
          commission: 15,
          bankAccount: {
            bankName: "Deutsche Bank",
            iban: "DE89370400440532013000",
            bic: "DEUTDEDBBER",
          },
          rating: 4.8,
          totalRentals: 150,
        },
      },
      {
        firstName: "Anna",
        lastName: "Schmidt",
        email: "agent2@wohnmobiltraum.de",
        password: "Agent@1234", // Use plain password, let model hash it
        role: "agent",
        status: "active",
        security: {
          emailVerified: true,
          emailVerifiedAt: new Date(),
        },
        agentProfile: {
          companyName: "Adventure Mobiles",
          taxNumber: "DE987654321",
          commission: 15,
          bankAccount: {
            bankName: "Commerzbank",
            iban: "DE89370400440532013001",
            bic: "COBADEFFXXX",
          },
          rating: 4.9,
          totalRentals: 200,
        },
      },
    ]);
    console.log("Created agent users");

    // Create test users
    const users = await User.create([
      {
        firstName: "John",
        lastName: "Doe",
        email: "john@example.com",
        password: "User@1234", // Use plain password, let model hash it
        role: "user",
        status: "active",
        security: {
          emailVerified: true,
          emailVerifiedAt: new Date(),
        },
      },
      {
        firstName: "Jane",
        lastName: "Smith",
        email: "jane@example.com",
        password: "User@1234", // Use plain password, let model hash it
        role: "user",
        status: "active",
        security: {
          emailVerified: true,
          emailVerifiedAt: new Date(),
        },
      },
    ]);
    console.log("Created test users");

    // Create vehicles
    const vehiclesData = [
      {
        name: "Mercedes Sprinter Deluxe",
        category: "Wohnmobil",
        owner: agents[0]._id,
        status: "aktiv",
        verificationStatus: "genehmigt",
        description: {
          short:
            "Luxuriöses Wohnmobil für 4 Personen mit vollständiger Ausstattung",
          long: "Erleben Sie unvergessliche Reisen mit unserem Mercedes Sprinter Deluxe. Dieses vollausgestattete Wohnmobil bietet Platz für 4 Personen und verfügt über eine moderne Küche, ein geräumiges Bad mit Dusche, und eine gemütliche Sitzecke. Perfekt für Familien oder Paare, die Komfort und Freiheit suchen.",
        },
        images: [
          {
            url: "https://images.unsplash.com/photo-1543395136-75b39bc00e0e?w=800",
            isMain: true,
          },
          {
            url: "https://images.unsplash.com/photo-1561361513-2d000a50f0dc?w=800",
            isMain: false,
          },
        ],
        technicalData: {
          brand: "Mercedes-Benz",
          model: "Sprinter 316 CDI",
          year: 2022,
          licensePlate: "B-WM-1001",
          vin: "WDB9061331N123456",
          fuelType: "Diesel",
          enginePower: 163,
          transmission: "Automatik",
          fuelConsumption: 9.5,
          tankCapacity: 75,
          mileage: 15000,
          length: 6.95,
          width: 2.2,
          height: 2.9,
          weight: 3500,
          maxWeight: 3500,
          requiredLicense: "B",
        },
        capacity: {
          seats: 4,
          sleepingPlaces: 4,
          waterTank: 100,
          wastewaterTank: 80,
          gasTank: 11,
          fridgeVolume: 90,
        },
        equipment: {
          kitchen: {
            available: true,
            refrigerator: true,
            freezer: true,
            stove: true,
            oven: false,
            microwave: true,
            coffeeMachine: true,
          },
          bathroom: {
            available: true,
            toilet: true,
            shower: true,
            sink: true,
            hotWater: true,
          },
          climate: {
            heating: true,
            airConditioning: true,
            ventilation: true,
          },
          entertainment: {
            tv: true,
            radio: true,
            bluetooth: true,
            wifi: true,
          },
          safety: {
            smokeDetector: true,
            fireExtinguisher: true,
            firstAidKit: true,
            emergencyHammer: true,
          },
          exterior: {
            awning: true,
            bikeRack: true,
            solarPanel: true,
            generator: false,
          },
          navigation: {
            gps: true,
            reversingCamera: true,
            parkingSensors: true,
          },
        },
        pricing: {
          basePrice: {
            perDay: 150,
            perWeek: 900,
            perMonth: 3200,
          },
          deposit: 1500,
          cleaningFee: 80,
          mileageIncluded: 200,
          extraMileagePrice: 0.35,
          insurance: {
            basic: 15,
            comprehensive: 25,
            premium: 35,
            deductible: 500,
          },
          extras: [
            { name: "Fahrradträger", price: 10, priceType: "pro_Tag" },
            { name: "Campingstühle", price: 5, priceType: "pro_Tag" },
            { name: "Navigationssystem", price: 8, priceType: "pro_Tag" },
            { name: "Bettwäsche-Set", price: 25, priceType: "pro_Miete" },
            { name: "Endreinigung", price: 80, priceType: "pro_Miete" },
          ],
        },
        availability: {
          isAvailable: true,
          minimumRentalDays: 3,
          maximumRentalDays: 30,
          advanceBookingDays: 180,
        },
        location: {
          address: {
            street: "Hauptstraße 10",
            city: "Berlin",
            state: "Berlin",
            postalCode: "10115",
            country: "Deutschland",
          },
          coordinates: {
            lat: 52.52,
            lng: 13.405,
          },
        },
        rules: [
          "Rauchen im Fahrzeug verboten",
          "Haustiere nach Absprache erlaubt",
          "Mindestalter des Fahrers: 23 Jahre",
          "Führerschein mindestens 2 Jahre",
          "Grenzüberschreitende Fahrten nur nach Absprache",
        ],
        statistics: {
          views: 0,
          bookings: 0,
          revenue: 0,
          rating: {
            average: 4.8,
            count: 12,
          },
        },
      },
      {
        name: "VW California Ocean",
        category: "Kastenwagen",
        owner: agents[0]._id,
        status: "aktiv",
        verificationStatus: "genehmigt",
        description: {
          short: "Kompakter Campervan ideal für Paare und kleine Familien",
          long: "Der VW California Ocean ist der perfekte Begleiter für spontane Wochenendtrips oder längere Reisen. Mit seiner kompakten Größe ist er einfach zu fahren und bietet dennoch allen Komfort, den Sie unterwegs brauchen.",
        },
        images: [
          {
            url: "https://images.unsplash.com/photo-1527786356703-4b100091cd2c?w=800",
            isMain: true,
          },
        ],
        technicalData: {
          brand: "Volkswagen",
          model: "California Ocean",
          year: 2023,
          licensePlate: "B-WM-2001",
          fuelType: "Diesel",
          enginePower: 150,
          transmission: "Manuell",
          fuelConsumption: 7.5,
          length: 4.9,
          width: 1.9,
          height: 1.99,
          weight: 2800,
          maxWeight: 3500,
          requiredLicense: "B",
        },
        capacity: {
          seats: 4,
          sleepingPlaces: 4,
          waterTank: 30,
          wastewaterTank: 30,
        },
        equipment: {
          kitchen: {
            available: true,
            refrigerator: true,
            stove: true,
            oven: false,
            microwave: false,
            coffeeMachine: false,
          },
          bathroom: {
            available: false,
            toilet: false,
            shower: false,
          },
          climate: {
            heating: true,
            airConditioning: false,
          },
          entertainment: {
            radio: true,
          },
          exterior: {
            awning: true,
          },
          navigation: {
            gps: true,
            reversingCamera: true,
            parkingSensors: true,
          },
        },
        pricing: {
          basePrice: {
            perDay: 110,
            perWeek: 660,
            perMonth: 2400,
          },
          deposit: 1000,
          cleaningFee: 60,
        },
        availability: {
          isAvailable: true,
          minimumRentalDays: 2,
        },
        location: {
          address: {
            street: "Hauptstraße 10",
            city: "Berlin",
            state: "Berlin",
            postalCode: "10115",
            country: "Deutschland",
          },
        },
        statistics: {
          rating: {
            average: 4.9,
            count: 25,
          },
        },
      },
      {
        name: "Hobby Optima De Luxe",
        category: "Wohnwagen",
        owner: agents[1]._id,
        status: "aktiv",
        verificationStatus: "genehmigt",
        description: {
          short: "Geräumiger Wohnwagen für die ganze Familie",
          long: "Der Hobby Optima De Luxe bietet großzügigen Platz für bis zu 6 Personen. Mit seiner hochwertigen Ausstattung und dem durchdachten Raumkonzept ist er ideal für Familienurlaube.",
        },
        images: [
          {
            url: "https://images.unsplash.com/photo-1523987355523-c7b5b0dd90a7?w=800",
            isMain: true,
          },
        ],
        technicalData: {
          brand: "Hobby",
          model: "Optima De Luxe T65",
          year: 2022,
          licensePlate: "B-WW-3001",
          fuelType: "Diesel",
          transmission: "Manuell",
          length: 7.5,
          width: 2.3,
          height: 2.6,
          weight: 1500,
          maxWeight: 1800,
          requiredLicense: "BE",
        },
        capacity: {
          seats: 6,
          sleepingPlaces: 6,
          waterTank: 45,
          wastewaterTank: 20,
        },
        equipment: {
          kitchen: {
            available: true,
            refrigerator: true,
            freezer: true,
            stove: true,
            oven: true,
            microwave: false,
            coffeeMachine: false,
          },
          bathroom: {
            available: true,
            toilet: true,
            shower: true,
            sink: true,
            hotWater: true,
          },
          climate: {
            heating: true,
            airConditioning: true,
          },
          entertainment: {
            tv: true,
            radio: true,
          },
          exterior: {
            awning: true,
          },
        },
        pricing: {
          basePrice: {
            perDay: 80,
            perWeek: 480,
            perMonth: 1600,
          },
          deposit: 800,
          cleaningFee: 50,
        },
        availability: {
          isAvailable: true,
          minimumRentalDays: 3,
        },
        location: {
          address: {
            street: "Campingstraße 15",
            city: "München",
            state: "Bayern",
            postalCode: "80331",
            country: "Deutschland",
          },
        },
        statistics: {
          rating: {
            average: 4.7,
            count: 18,
          },
        },
      },
    ];

    // Create vehicles with generated slugs
    for (const vehicleData of vehiclesData) {
      const vehicle = await Vehicle.create(vehicleData);
      console.log(`Created vehicle: ${vehicle.name}`);
    }

    console.log("\n✅ Database seeded successfully!");
    console.log("\nAdmin credentials:");
    console.log(`Email: ${process.env.ADMIN_EMAIL}`);
    console.log(`Password: ${process.env.ADMIN_PASSWORD}`);
    console.log("\nAgent credentials:");
    console.log("Email: agent1@wohnmobiltraum.de / agent2@wohnmobiltraum.de");
    console.log("Password: Agent@1234");
    console.log("\nUser credentials:");
    console.log("Email: john@example.com / jane@example.com");
    console.log("Password: User@1234");

    process.exit(0);
  } catch (error) {
    console.error("Seeding error:", error);
    process.exit(1);
  }
};

// Run seeder
seedDatabase();
