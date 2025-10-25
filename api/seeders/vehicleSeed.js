const mongoose = require("mongoose");
const dotenv = require("dotenv");
const Vehicle = require("../models/Vehicle.model");
const User = require("../models/User.model");

dotenv.config();

const vehicles = [
  {
    name: "Luxus Wohnmobil Hymer B-Klasse 2023",
    slug: "luxus-wohnmobil-hymer-b-klasse-2023",
    category: "Wohnmobil",
    technicalData: {
      brand: "Hymer",
      model: "B-Klasse Modern Comfort",
      year: 2023,
      length: 7.5,
      width: 2.3,
      height: 3.0,
      weight: 3200,
      maxWeight: 3500,
      fuelType: "Diesel",
      transmission: "Automatik",
      enginePower: 180,
      fuelConsumption: 9.5,
      tankCapacity: 90,
      requiredLicense: "B",
    },
    capacity: {
      seats: 4,
      sleepingPlaces: 4,
      beds: { fixed: 2, convertible: 2 },
    },
    equipment: {
      kitchen: {
        available: true,
        refrigerator: true,
        freezer: true,
        stove: true,
        oven: true,
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
        airbags: true,
        abs: true,
        esp: true,
        rearCamera: true,
        parkingSensors: true,
      },
      power: {
        solarPanel: true,
        externalPowerConnection: true,
      },
      water: {
        freshWaterTank: 120,
        wasteWaterTank: 100,
        waterPump: true,
      },
    },
    pricing: {
      basePrice: {
        perDay: 95,
        perWeek: 630,
        perMonth: 2400,
      },
      deposit: 1500,
      cleaningFee: 76,
      extras: [
        { name: "Fahrräder (2 Stück)", price: 15, priceType: "pro_Tag", maxQuantity: 1 },
        { name: "Campingtisch & Stühle", price: 25, priceType: "pro_Miete", maxQuantity: 1 },
        { name: "Bettwäsche", price: 20, priceType: "pro_Person", maxQuantity: 4 },
      ],
    },
    images: [
      {
        url: "https://images.unsplash.com/photo-1527786356703-4b100091cd2c",
        isMain: true,
        order: 1,
      },
    ],
    description: {
      short: "Luxuriöses Wohnmobil mit moderner Ausstattung für 4 Personen",
      long: "Erleben Sie Camping-Komfort der Extraklasse mit unserem Hymer B-Klasse Wohnmobil. Perfekt ausgestattet für lange Reisen mit Familie oder Freunden.",
      highlights: ["Vollausstattung", "Automatikgetriebe", "Solaranlage", "WLAN inklusive"],
    },
    location: {
      address: {
        street: "Hauptstraße 123",
        city: "München",
        state: "Bayern",
        postalCode: "80331",
        country: "Deutschland",
      },
    },
    owner: null, // Will be set dynamically
    status: "aktiv",
    verificationStatus: "genehmigt",
    featured: true,
  },
  {
    name: "Kompakter Kastenwagen VW California Ocean",
    slug: "kompakter-kastenwagen-vw-california-ocean",
    category: "Kastenwagen",
    technicalData: {
      brand: "Volkswagen",
      model: "California Ocean",
      year: 2024,
      length: 5.0,
      width: 1.9,
      height: 2.0,
      weight: 2800,
      maxWeight: 3080,
      fuelType: "Diesel",
      transmission: "Manuell",
      enginePower: 150,
      fuelConsumption: 7.5,
      tankCapacity: 70,
      requiredLicense: "B",
    },
    capacity: {
      seats: 4,
      sleepingPlaces: 4,
      beds: { fixed: 1, convertible: 3 },
    },
    equipment: {
      kitchen: {
        available: true,
        refrigerator: true,
        stove: true,
      },
      bathroom: {
        available: false,
      },
      climate: {
        heating: true,
        airConditioning: true,
      },
      entertainment: {
        radio: true,
        bluetooth: true,
      },
      safety: {
        airbags: true,
        abs: true,
        esp: true,
        rearCamera: true,
      },
      power: {
        solarPanel: true,
      },
      water: {
        freshWaterTank: 30,
        wasteWaterTank: 25,
      },
    },
    pricing: {
      basePrice: {
        perDay: 75,
        perWeek: 490,
        perMonth: 1900,
      },
      deposit: 1000,
      cleaningFee: 50,
      extras: [],
    },
    images: [
      {
        url: "https://images.unsplash.com/photo-1464219789935-c2d9d9aba644",
        isMain: true,
        order: 1,
      },
    ],
    description: {
      short: "Wendiger Kastenwagen ideal für Paare und Stadtreisen",
      long: "Der VW California Ocean bietet maximale Flexibilität bei kompakten Maßen. Perfekt für spontane Wochenendtrips.",
      highlights: ["Kompakt & wendig", "Parkplatzfreundlich", "Vollausgestattet", "Neuestes Modell"],
    },
    location: {
      address: {
        street: "Berliner Allee 45",
        city: "Berlin",
        state: "Berlin",
        postalCode: "10179",
        country: "Deutschland",
      },
    },
    owner: null,
    status: "aktiv",
    verificationStatus: "genehmigt",
    featured: true,
  },
  {
    name: "Familien-Wohnmobil Dethleffs Globebus",
    slug: "familien-wohnmobil-dethleffs-globebus",
    category: "Wohnmobil",
    technicalData: {
      brand: "Dethleffs",
      model: "Globebus I7",
      year: 2023,
      length: 7.2,
      width: 2.05,
      height: 2.8,
      weight: 3200,
      maxWeight: 3500,
      fuelType: "Diesel",
      transmission: "Manuell",
      enginePower: 140,
      fuelConsumption: 8.5,
      tankCapacity: 75,
      requiredLicense: "B",
    },
    capacity: {
      seats: 6,
      sleepingPlaces: 6,
      beds: { fixed: 3, convertible: 3 },
    },
    equipment: {
      kitchen: {
        available: true,
        refrigerator: true,
        freezer: true,
        stove: true,
        oven: true,
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
        bluetooth: true,
      },
      safety: {
        airbags: true,
        abs: true,
        esp: true,
        rearCamera: true,
        parkingSensors: true,
      },
      power: {
        solarPanel: true,
      },
      water: {
        freshWaterTank: 110,
        wasteWaterTank: 90,
      },
    },
    pricing: {
      basePrice: {
        perDay: 110,
        perWeek: 735,
        perMonth: 2800,
      },
      deposit: 2000,
      cleaningFee: 90,
      extras: [
        { name: "Kindersitze", price: 5, priceType: "pro_Tag", maxQuantity: 3 },
        { name: "GPS Navigation", price: 35, priceType: "pro_Miete", maxQuantity: 1 },
      ],
    },
    images: [
      {
        url: "https://images.unsplash.com/photo-1523987355523-c7b5b0dd90a7",
        isMain: true,
        order: 1,
      },
    ],
    description: {
      short: "Geräumiges Familien-Wohnmobil für bis zu 6 Personen",
      long: "Perfekt für große Familien! Mit 6 Schlafplätzen und viel Stauraum bietet dieser Dethleffs Globebus alles für einen unvergesslichen Familienurlaub.",
      highlights: ["6 Schlafplätze", "Familienfreundlich", "Große Küche", "Separate Dusche"],
    },
    location: {
      address: {
        street: "Hafenstraße 78",
        city: "Hamburg",
        state: "Hamburg",
        postalCode: "20457",
        country: "Deutschland",
      },
    },
    owner: null,
    status: "aktiv",
    verificationStatus: "genehmigt",
    featured: false,
  },
];

// Add 7 more vehicles with variations
const additionalVehicles = [
  { ...vehicles[0], name: "Hymer B-Klasse Premium 2024", slug: "hymer-b-klasse-premium-2024", pricing: { ...vehicles[0].pricing, basePrice: { perDay: 120, perWeek: 800, perMonth: 3000 } }, location: { address: { ...vehicles[0].location.address, city: "Frankfurt", postalCode: "60311" } } },
  { ...vehicles[1], name: "VW California Beach 2023", slug: "vw-california-beach-2023", pricing: { ...vehicles[1].pricing, basePrice: { perDay: 65, perWeek: 420, perMonth: 1600 } }, location: { address: { ...vehicles[1].location.address, city: "Köln", postalCode: "50667" } } },
  { ...vehicles[2], name: "Dethleffs Trend 2024", slug: "dethleffs-trend-2024", pricing: { ...vehicles[2].pricing, basePrice: { perDay: 100, perWeek: 650, perMonth: 2500 } }, location: { address: { ...vehicles[2].location.address, city: "Stuttgart", postalCode: "70173" } } },
  { ...vehicles[0], name: "Hymer Exsis 2023", slug: "hymer-exsis-2023", pricing: { ...vehicles[0].pricing, basePrice: { perDay: 85, perWeek: 560, perMonth: 2100 } }, location: { address: { ...vehicles[0].location.address, city: "Düsseldorf", postalCode: "40210" } }, featured: false },
  { ...vehicles[1], name: "Mercedes Marco Polo 2024", slug: "mercedes-marco-polo-2024", technicalData: { ...vehicles[1].technicalData, brand: "Mercedes-Benz", model: "Marco Polo" }, pricing: { ...vehicles[1].pricing, basePrice: { perDay: 90, perWeek: 600, perMonth: 2300 } }, location: { address: { ...vehicles[1].location.address, city: "Leipzig", postalCode: "04103" } } },
  { ...vehicles[2], name: "Weinsberg CaraBus 2023", slug: "weinsberg-carabus-2023", technicalData: { ...vehicles[2].technicalData, brand: "Weinsberg", model: "CaraBus 600" }, pricing: { ...vehicles[2].pricing, basePrice: { perDay: 95, perWeek: 630, perMonth: 2400 } }, location: { address: { ...vehicles[2].location.address, city: "Dresden", postalCode: "01067" } } },
  { ...vehicles[0], name: "Bürstner Lyseo 2024", slug: "burstner-lyseo-2024", technicalData: { ...vehicles[0].technicalData, brand: "Bürstner", model: "Lyseo TD" }, pricing: { ...vehicles[0].pricing, basePrice: { perDay: 105, perWeek: 700, perMonth: 2700 } }, location: { address: { ...vehicles[0].location.address, city: "Hannover", postalCode: "30159" } }, featured: true },
];

const allVehicles = [...vehicles, ...additionalVehicles];

const seedVehicles = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log("✅ Connected to MongoDB");

    // Delete all existing vehicles
    await Vehicle.deleteMany({});
    console.log("🗑️  Deleted all existing vehicles");

    // Find an agent user or create one
    let agent = await User.findOne({ role: "agent" });
    if (!agent) {
      console.log("⚠️  No agent found, creating one...");
      const bcrypt = require("bcryptjs");
      agent = await User.create({
        firstName: "Test",
        lastName: "Agent",
        email: "agent@test.com",
        password: await bcrypt.hash("Test123!", 10),
        role: "agent",
        isEmailVerified: true,
        permissions: {
          canCreateVehicle: true,
          canEditVehicle: true,
          canDeleteVehicle: true,
          canManageBookings: true,
        },
      });
      console.log("✅ Test agent created");
    }

    // Assign owner to all vehicles
    const vehiclesToCreate = allVehicles.map(v => ({
      ...v,
      owner: agent._id,
    }));

    // Create vehicles
    const createdVehicles = await Vehicle.insertMany(vehiclesToCreate);
    console.log(`✅ Created ${createdVehicles.length} vehicles`);

    console.log("\n🎉 Seeding completed successfully!");
    console.log(`\n📊 Summary:`);
    console.log(`   - Vehicles: ${createdVehicles.length}`);
    console.log(`   - Agent: ${agent.email} (password: Test123!)`);
    console.log(`\n💡 You can now view vehicles at: http://localhost:5173/vehicles`);

    process.exit(0);
  } catch (error) {
    console.error("❌ Seeding failed:", error);
    process.exit(1);
  }
};

seedVehicles();
