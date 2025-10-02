// backend/tests/vehicle.test.js
const request = require("supertest");
const app = require("../server");
const Vehicle = require("../models/Vehicle.model");
const User = require("../models/User.model");
const mongoose = require("mongoose");

describe("Vehicle Tests", () => {
  let agentToken;
  let adminToken;
  let agentId;

  beforeAll(async () => {
    await mongoose.connect(process.env.MONGODB_TEST_URI);

    // Create agent user
    const agent = await User.create({
      firstName: "Agent",
      lastName: "Test",
      email: "agent@test.com",
      password: "Agent@1234",
      role: "agent",
      agentProfile: {
        companyName: "Test Company",
        commission: 15,
      },
      security: { emailVerified: true },
    });
    agentId = agent._id;

    // Create admin user
    await User.create({
      firstName: "Admin",
      lastName: "Test",
      email: "admin@test.com",
      password: "Admin@1234",
      role: "admin",
      security: { emailVerified: true },
    });

    // Get tokens
    const agentResponse = await request(app)
      .post("/api/auth/login")
      .send({ email: "agent@test.com", password: "Agent@1234" });
    agentToken = agentResponse.body.data.token;

    const adminResponse = await request(app)
      .post("/api/auth/login")
      .send({ email: "admin@test.com", password: "Admin@1234" });
    adminToken = adminResponse.body.data.token;
  });

  afterAll(async () => {
    await mongoose.connection.close();
  });

  beforeEach(async () => {
    await Vehicle.deleteMany({});
  });

  describe("POST /api/vehicles", () => {
    const vehicleData = {
      name: "Test Wohnmobil",
      category: "Wohnmobil",
      description: {
        short: "Kurze Beschreibung",
        long: "Lange detaillierte Beschreibung des Fahrzeugs",
      },
      technicalData: {
        brand: "Mercedes",
        model: "Sprinter",
        year: 2022,
        licensePlate: "B-WM-1234",
        engineType: "Diesel",
        transmission: "Automatik",
        fuelConsumption: 8.5,
        length: 7.0,
        width: 2.2,
        height: 2.9,
        weight: 3500,
      },
      capacity: {
        seats: 4,
        sleepingPlaces: 4,
        waterTank: 100,
        wastewaterTank: 80,
        gasTank: 11,
      },
      equipment: {
        kitchen: true,
        shower: true,
        toilet: true,
        heater: true,
        airCondition: true,
        solarPanel: false,
        bikeRack: true,
        awning: true,
        navigationSystem: true,
        reversingCamera: true,
        cruiseControl: true,
      },
      pricing: {
        basePrice: {
          perDay: 120,
          perWeek: 750,
          perMonth: 2800,
        },
        deposit: 1500,
        cleaningFee: 80,
        insurance: {
          basic: 15,
          comprehensive: 25,
          premium: 35,
          deductible: 500,
        },
      },
      location: {
        address: {
          street: "Teststraße 1",
          city: "Berlin",
          state: "Berlin",
          postalCode: "10115",
          country: "Deutschland",
        },
      },
    };

    it("should create vehicle as agent", async () => {
      const response = await request(app)
        .post("/api/vehicles")
        .set("Authorization", `Bearer ${agentToken}`)
        .send(vehicleData)
        .expect(201);

      expect(response.body.success).toBe(true);
      expect(response.body.data.name).toBe(vehicleData.name);
      expect(response.body.data.owner).toBe(agentId.toString());
      expect(response.body.data.verificationStatus).toBe("ausstehend");
    });

    it("should create vehicle with approved status as admin", async () => {
      const response = await request(app)
        .post("/api/vehicles")
        .set("Authorization", `Bearer ${adminToken}`)
        .send(vehicleData)
        .expect(201);

      expect(response.body.success).toBe(true);
      expect(response.body.data.verificationStatus).toBe("genehmigt");
    });

    it("should not create vehicle without authentication", async () => {
      await request(app).post("/api/vehicles").send(vehicleData).expect(401);
    });
  });

  describe("GET /api/vehicles", () => {
    beforeEach(async () => {
      // Create test vehicles
      await Vehicle.create([
        {
          name: "Wohnmobil 1",
          slug: "wohnmobil-1",
          category: "Wohnmobil",
          owner: agentId,
          status: "aktiv",
          verificationStatus: "genehmigt",
          technicalData: {
            brand: "Mercedes",
            model: "Sprinter",
            year: 2022,
          },
          capacity: { seats: 4, sleepingPlaces: 4 },
          pricing: { basePrice: { perDay: 120 } },
        },
        {
          name: "Wohnwagen 1",
          slug: "wohnwagen-1",
          category: "Wohnwagen",
          owner: agentId,
          status: "aktiv",
          verificationStatus: "genehmigt",
          technicalData: {
            brand: "Hobby",
            model: "Premium",
            year: 2021,
          },
          capacity: { seats: 4, sleepingPlaces: 4 },
          pricing: { basePrice: { perDay: 80 } },
        },
      ]);
    });

    it("should get all vehicles", async () => {
      const response = await request(app).get("/api/vehicles").expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.vehicles).toHaveLength(2);
    });

    it("should filter vehicles by category", async () => {
      const response = await request(app)
        .get("/api/vehicles?category=Wohnmobil")
        .expect(200);

      expect(response.body.data.vehicles).toHaveLength(1);
      expect(response.body.data.vehicles[0].category).toBe("Wohnmobil");
    });

    it("should filter vehicles by price range", async () => {
      const response = await request(app)
        .get("/api/vehicles?minPrice=50&maxPrice=100")
        .expect(200);

      expect(response.body.data.vehicles).toHaveLength(1);
      expect(response.body.data.vehicles[0].name).toBe("Wohnwagen 1");
    });
  });
});
