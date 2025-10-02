// backend/tests/auth.test.js
const request = require("supertest");
const app = require("../server");
const User = require("../models/User.model");
const mongoose = require("mongoose");

describe("Authentication Tests", () => {
  beforeAll(async () => {
    // Connect to test database
    await mongoose.connect(process.env.MONGODB_TEST_URI);
  });

  afterAll(async () => {
    await mongoose.connection.close();
  });

  beforeEach(async () => {
    await User.deleteMany({});
  });

  describe("POST /api/auth/register", () => {
    it("should register a new user", async () => {
      const userData = {
        firstName: "Test",
        lastName: "User",
        email: "test@example.com",
        password: "Test@1234",
        phone: "+49 30 12345678",
      };

      const response = await request(app)
        .post("/api/auth/register")
        .send(userData)
        .expect(201);

      expect(response.body.success).toBe(true);
      expect(response.body.data.user.email).toBe(userData.email);
      expect(response.body.data.token).toBeDefined();
    });

    it("should not register user with existing email", async () => {
      const userData = {
        firstName: "Test",
        lastName: "User",
        email: "test@example.com",
        password: "Test@1234",
      };

      // Create first user
      await User.create(userData);

      // Try to create duplicate
      const response = await request(app)
        .post("/api/auth/register")
        .send(userData)
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toContain("existiert bereits");
    });

    it("should validate password strength", async () => {
      const userData = {
        firstName: "Test",
        lastName: "User",
        email: "test@example.com",
        password: "weak",
      };

      const response = await request(app)
        .post("/api/auth/register")
        .send(userData)
        .expect(400);

      expect(response.body.success).toBe(false);
    });
  });

  describe("POST /api/auth/login", () => {
    it("should login with valid credentials", async () => {
      const userData = {
        firstName: "Test",
        lastName: "User",
        email: "test@example.com",
        password: "Test@1234",
        security: { emailVerified: true },
      };

      await User.create(userData);

      const response = await request(app)
        .post("/api/auth/login")
        .send({
          email: userData.email,
          password: "Test@1234",
        })
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.token).toBeDefined();
      expect(response.body.data.user.email).toBe(userData.email);
    });

    it("should not login with invalid password", async () => {
      const userData = {
        firstName: "Test",
        lastName: "User",
        email: "test@example.com",
        password: "Test@1234",
        security: { emailVerified: true },
      };

      await User.create(userData);

      const response = await request(app)
        .post("/api/auth/login")
        .send({
          email: userData.email,
          password: "WrongPassword",
        })
        .expect(401);

      expect(response.body.success).toBe(false);
    });

    it("should lock account after multiple failed attempts", async () => {
      const userData = {
        firstName: "Test",
        lastName: "User",
        email: "test@example.com",
        password: "Test@1234",
        security: { emailVerified: true },
      };

      await User.create(userData);

      // Make 5 failed login attempts
      for (let i = 0; i < 5; i++) {
        await request(app).post("/api/auth/login").send({
          email: userData.email,
          password: "WrongPassword",
        });
      }

      // 6th attempt should be locked
      const response = await request(app)
        .post("/api/auth/login")
        .send({
          email: userData.email,
          password: "Test@1234",
        })
        .expect(423);

      expect(response.body.message).toContain("gesperrt");
    });
  });

  describe("Protected Routes", () => {
    let token;
    let userId;

    beforeEach(async () => {
      const userData = {
        firstName: "Test",
        lastName: "User",
        email: "test@example.com",
        password: "Test@1234",
        security: { emailVerified: true },
      };

      const user = await User.create(userData);
      userId = user._id;

      const response = await request(app).post("/api/auth/login").send({
        email: userData.email,
        password: "Test@1234",
      });

      token = response.body.data.token;
    });

    it("should access protected route with valid token", async () => {
      const response = await request(app)
        .get("/api/auth/me")
        .set("Authorization", `Bearer ${token}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.user._id).toBe(userId.toString());
    });

    it("should not access protected route without token", async () => {
      await request(app).get("/api/auth/me").expect(401);
    });

    it("should not access protected route with invalid token", async () => {
      await request(app)
        .get("/api/auth/me")
        .set("Authorization", "Bearer invalid_token")
        .expect(401);
    });
  });
});
