const mongoose = require("mongoose");

const vehicleSchema = new mongoose.Schema(
  {
    // Basic Information
    name: {
      type: String,
      required: [true, "Fahrzeugname ist erforderlich"],
      trim: true,
      maxlength: [100, "Name darf maximal 100 Zeichen lang sein"],
    },
    slug: {
      type: String,
      unique: true,
      lowercase: true,
    },
    category: {
      type: String,
      required: true,
      enum: ["Wohnmobil", "Wohnwagen", "Kastenwagen"],
    },
    technicalData: {
      brand: { type: String, required: true },
      model: { type: String, required: true },
      year: {
        type: Number,
        required: true,
        min: [1990, "Baujahr muss 1990 oder später sein"],
        max: [new Date().getFullYear() + 1, "Ungültiges Baujahr"],
      },
      length: { type: Number, required: true }, // in meters
      width: { type: Number, required: true },
      height: { type: Number, required: true },
      weight: { type: Number, required: true }, // in kg
      maxWeight: { type: Number, required: true },
      fuelType: {
        type: String,
        enum: ["Diesel", "Benzin", "Elektro", "Hybrid"],
        required: true,
      },
      transmission: {
        type: String,
        enum: ["Manuell", "Automatik"],
        required: true,
      },
      enginePower: { type: Number }, // in PS
      fuelConsumption: { type: Number }, // L/100km
      tankCapacity: { type: Number }, // in liters
      licensePlate: { type: String },
      chassisNumber: { type: String },
      requiredLicense: {
        type: String,
        enum: ["B", "B96", "BE", "C1", "C"],
        required: true,
      },
    },

    // Capacity (Kapazität)
    capacity: {
      seats: {
        type: Number,
        required: true,
        min: [1, "Mindestens 1 Sitzplatz erforderlich"],
        max: [10, "Maximal 10 Sitzplätze"],
      },
      sleepingPlaces: {
        type: Number,
        required: true,
        min: [1, "Mindestens 1 Schlafplatz erforderlich"],
        max: [8, "Maximal 8 Schlafplätze"],
      },
      beds: {
        fixed: { type: Number, default: 0 },
        convertible: { type: Number, default: 0 },
      },
    },

    // Equipment (Ausstattung)
    equipment: {
      kitchen: {
        available: { type: Boolean, default: false },
        refrigerator: { type: Boolean, default: false },
        freezer: { type: Boolean, default: false },
        stove: { type: Boolean, default: false },
        oven: { type: Boolean, default: false },
        microwave: { type: Boolean, default: false },
        coffeeMachine: { type: Boolean, default: false },
        dishwasher: { type: Boolean, default: false },
      },
      bathroom: {
        available: { type: Boolean, default: false },
        toilet: { type: Boolean, default: false },
        shower: { type: Boolean, default: false },
        sink: { type: Boolean, default: false },
        hotWater: { type: Boolean, default: false },
      },
      climate: {
        heating: { type: Boolean, default: false },
        airConditioning: { type: Boolean, default: false },
        ventilation: { type: Boolean, default: false },
      },
      entertainment: {
        tv: { type: Boolean, default: false },
        radio: { type: Boolean, default: false },
        bluetooth: { type: Boolean, default: false },
        wifi: { type: Boolean, default: false },
        satellite: { type: Boolean, default: false },
      },
      safety: {
        airbags: { type: Boolean, default: false },
        abs: { type: Boolean, default: false },
        esp: { type: Boolean, default: false },
        rearCamera: { type: Boolean, default: false },
        parkingSensors: { type: Boolean, default: false },
        alarm: { type: Boolean, default: false },
        safe: { type: Boolean, default: false },
      },
      outdoor: {
        awning: { type: Boolean, default: false },
        bikeRack: { type: Boolean, default: false },
        roofRack: { type: Boolean, default: false },
        towbar: { type: Boolean, default: false },
        outdoorFurniture: { type: Boolean, default: false },
        grill: { type: Boolean, default: false },
      },
      power: {
        solarPanel: { type: Boolean, default: false },
        generator: { type: Boolean, default: false },
        powerInverter: { type: Boolean, default: false },
        externalPowerConnection: { type: Boolean, default: false },
      },
      water: {
        freshWaterTank: { type: Number, default: 0 }, // in liters
        wasteWaterTank: { type: Number, default: 0 },
        waterPump: { type: Boolean, default: false },
      },
    },

    // Inventory (Inventar)
    inventory: {
      bedding: {
        pillows: { type: Number, default: 0 },
        blankets: { type: Number, default: 0 },
        sheets: { type: Number, default: 0 },
      },
      kitchen: {
        plates: { type: Number, default: 0 },
        cups: { type: Number, default: 0 },
        glasses: { type: Number, default: 0 },
        cutlery: { type: Number, default: 0 },
        pots: { type: Number, default: 0 },
        pans: { type: Number, default: 0 },
      },
      cleaning: {
        cleaningProducts: { type: Boolean, default: false },
        vacuum: { type: Boolean, default: false },
        broom: { type: Boolean, default: false },
      },
      other: {
        firstAidKit: { type: Boolean, default: false },
        fireExtinguisher: { type: Boolean, default: false },
        warningTriangle: { type: Boolean, default: false },
        toolkit: { type: Boolean, default: false },
      },
    },

    // Pricing (Preise)
    pricing: {
      basePrice: {
        perDay: {
          type: Number,
          required: true,
          min: [0, "Preis muss positiv sein"],
        },
        perWeek: Number,
        perMonth: Number,
      },
      seasonPricing: [
        {
          name: String,
          startDate: Date,
          endDate: Date,
          pricePerDay: Number,
        },
      ],
      deposit: {
        type: Number,
        required: true,
        min: [0, "Kaution muss positiv sein"],
      },
      cleaningFee: {
        type: Number,
        default: 0,
      },
      mileage: {
        included: { type: Number, default: 200 }, // km per day
        extraCost: { type: Number, default: 0.35 }, // per km
      },
      insurance: {
        basic: { type: Number, default: 15 }, // per day
        comprehensive: { type: Number, default: 25 }, // per day
        deductible: { type: Number, default: 1500 },
      },
      discount: {
        enabled: { type: Boolean, default: false },
        percentage: { type: Number, min: 0, max: 100 },
        validFrom: Date,
        validUntil: Date,
        code: String,
      },
      extras: [
        {
          name: String,
          price: Number,
          priceType: {
            type: String,
            enum: ["pro_Tag", "pro_Miete", "pro_Person"],
          },
          maxQuantity: Number,
        },
      ],
    },

    // Images
    images: [
      {
        url: {
          type: String,
          required: true,
        },
        cloudinaryId: String,
        caption: String,
        isMain: {
          type: Boolean,
          default: false,
        },
        order: Number,
      },
    ],

    // Description
    description: {
      short: {
        type: String,
        required: true,
        maxlength: [200, "Kurzbeschreibung darf maximal 200 Zeichen lang sein"],
      },
      long: {
        type: String,
        required: true,
        maxlength: [2000, "Beschreibung darf maximal 2000 Zeichen lang sein"],
      },
      highlights: [String],
    },

    // Location
    location: {
      address: {
        street: String,
        city: String,
        state: String,
        postalCode: String,
        country: { type: String, default: "Deutschland" },
      },
      coordinates: {
        lat: Number,
        lng: Number,
      },
      pickupInstructions: String,
    },

    // Availability
    availability: {
      isAvailable: {
        type: Boolean,
        default: true,
      },
      calendar: [
        {
          date: Date,
          available: Boolean,
          price: Number,
          bookingId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Booking",
          },
        },
      ],
      minimumRental: {
        type: Number,
        default: 2,
        min: 1,
      },
      maximumRental: {
        type: Number,
        default: 30,
      },
      advanceBooking: {
        minimum: { type: Number, default: 1 }, // days
        maximum: { type: Number, default: 365 }, // days
      },
    },

    // Rules & Policies
    rules: {
      minAge: {
        type: Number,
        default: 25,
        min: 18,
      },
      maxAge: {
        type: Number,
        default: 75,
      },
      smokingAllowed: {
        type: Boolean,
        default: false,
      },
      petsAllowed: {
        type: Boolean,
        default: false,
      },
      festivalsAllowed: {
        type: Boolean,
        default: true,
      },
      foreignTravelAllowed: {
        type: Boolean,
        default: true,
      },
      allowedCountries: [String],
      cancellationPolicy: {
        type: String,
        enum: ["flexibel", "moderat", "streng"],
        default: "moderat",
      },
    },

    // Owner Information
    owner: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    // Statistics
    statistics: {
      views: { type: Number, default: 0 },
      bookings: { type: Number, default: 0 },
      revenue: { type: Number, default: 0 },
      rating: {
        average: { type: Number, default: 0, min: 0, max: 5 },
        count: { type: Number, default: 0 },
      },
    },

    // SEO
    seo: {
      metaTitle: String,
      metaDescription: String,
      keywords: [String],
    },

    // Status
    status: {
      type: String,
      enum: ["aktiv", "inaktiv", "wartung", "ausgemustert"],
      default: "aktiv",
    },

    featured: {
      type: Boolean,
      default: false,
    },

    verificationStatus: {
      type: String,
      enum: ["ausstehend", "genehmigt", "abgelehnt"],
      default: "ausstehend",
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// Indexes
vehicleSchema.index({ category: 1, status: 1 });
vehicleSchema.index({ "pricing.basePrice.perDay": 1 });
vehicleSchema.index({ "capacity.seats": 1, "capacity.sleepingPlaces": 1 });
vehicleSchema.index({ "location.coordinates": "2dsphere" });
vehicleSchema.index({ owner: 1 });
vehicleSchema.index({ featured: -1, createdAt: -1 });

// Generate slug before saving
vehicleSchema.pre("save", function (next) {
  if (this.isModified("name")) {
    this.slug = this.name
      .toLowerCase()
      .replace(/ä/g, "ae")
      .replace(/ö/g, "oe")
      .replace(/ü/g, "ue")
      .replace(/ß/g, "ss")
      .replace(/[^\w\s-]/g, "")
      .replace(/\s+/g, "-")
      .replace(/-+/g, "-")
      .trim();

    // Add random string to ensure uniqueness
    this.slug += "-" + Math.random().toString(36).substring(2, 8);
  }
  next();
});

module.exports = mongoose.model("Vehicle", vehicleSchema);
