const mongoose = require('mongoose');
require('dotenv').config();

const Vehicle = require('../models/Vehicle.model');
const User = require('../models/User.model');

// Random vehicle data
const brands = ['Bürstner', 'Dethleffs', 'Knaus', 'Weinsberg', 'Hymer', 'Carado', 'Sunlight', 'LMC', 'Hobby', 'Fendt'];
const fuelTypes = ['Diesel', 'Diesel', 'Diesel', 'Benzin'];
const transmissions = ['Automatik', 'Automatik', 'Manuell'];
const categories = ['Wohnmobil', 'Wohnwagen', 'Kastenwagen'];
const licenses = ['B', 'B96', 'BE', 'C1'];

// Random vehicle images from Unsplash
const vehicleImages = [
  'https://images.unsplash.com/photo-1527786356703-4b100091cd2c?w=800',
  'https://images.unsplash.com/photo-1464219789935-c2d9d9aba644?w=800',
  'https://images.unsplash.com/photo-1519642899-62d7863faa7b?w=800',
  'https://images.unsplash.com/photo-1523987355523-c7b5b0dd90a7?w=800',
  'https://images.unsplash.com/photo-1469854523086-cc02fe5d8800?w=800',
  'https://images.unsplash.com/photo-1484788984921-03950022c9ef?w=800',
  'https://images.unsplash.com/photo-1513506003901-1e6a229e2d15?w=800',
  'https://images.unsplash.com/photo-1533230408708-8f9f91d1235c?w=800',
  'https://images.unsplash.com/photo-1523987355523-c7b5b0dd90a7?w=800',
  'https://images.unsplash.com/photo-1578328819058-b69f3a3b0f6b?w=800',
  'https://images.unsplash.com/photo-1527786356703-4b100091cd2c?w=800',
  'https://images.unsplash.com/photo-1504280390367-361c6d9f38f4?w=800',
  'https://images.unsplash.com/photo-1581873372796-656183d1f3a0?w=800',
  'https://images.unsplash.com/photo-1527952969610-b021e0d3fa84?w=800',
  'https://images.unsplash.com/photo-1609173122990-d0c3c3f3b221?w=800',
  'https://images.unsplash.com/photo-1595840086875-7e99bf1870d1?w=800',
  'https://images.unsplash.com/photo-1594990388141-1e816bfec01f?w=800',
  'https://images.unsplash.com/photo-1533361995986-630d5e8ac89c?w=800',
  'https://images.unsplash.com/photo-1566166748131-d5c7a5a6c01f?w=800',
  'https://images.unsplash.com/photo-1544620347-c4fd4a3d5957?w=800',
];

const cities = ['Haltern am See', 'Münster', 'Dortmund', 'Essen', 'Düsseldorf', 'Köln', 'Hamburg', 'Berlin'];

function randomInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function randomChoice(array) {
  return array[Math.floor(Math.random() * array.length)];
}

function randomBool(probability = 0.5) {
  return Math.random() < probability;
}

function generateVehicle(ownerId, index) {
  const brand = randomChoice(brands);
  const category = randomChoice(categories);
  const year = randomInt(2018, 2024);
  const seats = randomInt(2, 6);
  const sleepingPlaces = randomInt(2, 6);
  const basePrice = randomInt(60, 180);
  const city = randomChoice(cities);

  const modelNames = {
    'Wohnmobil': ['Lyseo', 'Nexxo', 'Ixeo', 'Grand Canyon', 'Exsis'],
    'Wohnwagen': ['Tabbert', 'Exclusiv', 'Silver', 'Touring', 'Vivaldi'],
    'Kastenwagen': ['Free', 'Tour', 'Compact', 'Active', 'Crosscamp']
  };

  const model = randomChoice(modelNames[category]) + ' ' + randomInt(400, 700);
  const name = `${brand} ${model} ${year}`;

  return {
    name,
    category,
    technicalData: {
      brand,
      model,
      year,
      length: parseFloat((category === 'Kastenwagen' ? randomInt(55, 65) / 10 : randomInt(65, 85) / 10).toFixed(2)),
      width: 2.3,
      height: parseFloat(randomInt(27, 32) / 10).toFixed(2),
      weight: randomInt(2500, 3500),
      maxWeight: randomInt(3500, 4500),
      fuelType: randomChoice(fuelTypes),
      transmission: randomChoice(transmissions),
      enginePower: randomInt(115, 180),
      fuelConsumption: parseFloat((randomInt(75, 95) / 10).toFixed(1)),
      tankCapacity: randomInt(70, 90),
      requiredLicense: randomChoice(licenses),
    },
    capacity: {
      seats,
      sleepingPlaces,
      beds: {
        fixed: randomInt(1, 2),
        convertible: randomInt(0, 2),
      },
    },
    equipment: {
      kitchen: {
        available: true,
        refrigerator: true,
        freezer: randomBool(0.6),
        stove: true,
        oven: randomBool(0.4),
        microwave: randomBool(0.5),
        coffeeMachine: randomBool(0.7),
        dishwasher: randomBool(0.2),
      },
      bathroom: {
        available: category !== 'Kastenwagen' ? true : randomBool(0.6),
        toilet: true,
        shower: randomBool(0.8),
        sink: true,
        hotWater: randomBool(0.9),
      },
      climate: {
        heating: true,
        airConditioning: randomBool(0.7),
        ventilation: true,
      },
      entertainment: {
        tv: randomBool(0.5),
        radio: true,
        bluetooth: true,
        wifi: randomBool(0.6),
        satellite: randomBool(0.4),
      },
      safety: {
        airbags: true,
        abs: true,
        esp: true,
        rearCamera: randomBool(0.8),
        parkingSensors: randomBool(0.9),
        alarm: randomBool(0.5),
        safe: randomBool(0.3),
      },
      outdoor: {
        awning: randomBool(0.8),
        bikeRack: randomBool(0.6),
        roofRack: randomBool(0.4),
        towbar: randomBool(0.3),
        outdoorFurniture: randomBool(0.5),
        grill: randomBool(0.4),
      },
      power: {
        solarPanel: randomBool(0.6),
        generator: randomBool(0.3),
        powerInverter: randomBool(0.7),
        externalPowerConnection: true,
      },
      water: {
        freshWaterTank: randomInt(80, 150),
        wasteWaterTank: randomInt(70, 120),
        waterPump: true,
      },
    },
    inventory: {
      bedding: {
        pillows: seats * 2,
        blankets: sleepingPlaces,
        sheets: sleepingPlaces * 2,
      },
      kitchen: {
        plates: seats * 2,
        cups: seats * 2,
        glasses: seats * 2,
        cutlery: seats * 4,
        pots: 3,
        pans: 2,
      },
      cleaning: {
        cleaningProducts: true,
        vacuum: randomBool(0.6),
        broom: true,
      },
      other: {
        firstAidKit: true,
        fireExtinguisher: true,
        warningTriangle: true,
        toolkit: true,
      },
    },
    pricing: {
      basePrice: {
        perDay: basePrice,
        perWeek: Math.round(basePrice * 6.5),
        perMonth: Math.round(basePrice * 25),
      },
      deposit: randomInt(800, 1500),
      cleaningFee: randomInt(60, 120),
      mileage: {
        included: randomChoice([150, 200, 250]),
        extraCost: 0.35,
      },
      insurance: {
        basic: 15,
        comprehensive: 25,
        deductible: randomChoice([1000, 1500, 2000]),
      },
      extras: [
        {
          name: 'Fahrradträger',
          price: 5,
          priceType: 'pro_Tag',
          maxQuantity: 1,
        },
        {
          name: 'Campingtisch & Stühle',
          price: 25,
          priceType: 'pro_Miete',
          maxQuantity: 1,
        },
        {
          name: 'Bettwäsche-Set',
          price: 15,
          priceType: 'pro_Person',
          maxQuantity: 6,
        },
        {
          name: 'Navigationsgerät',
          price: 3,
          priceType: 'pro_Tag',
          maxQuantity: 1,
        },
      ],
    },
    images: [
      {
        url: vehicleImages[index % vehicleImages.length],
        caption: 'Außenansicht',
        isMain: true,
        order: 1,
      },
      {
        url: vehicleImages[(index + 1) % vehicleImages.length],
        caption: 'Innenraum',
        isMain: false,
        order: 2,
      },
      {
        url: vehicleImages[(index + 2) % vehicleImages.length],
        caption: 'Küche',
        isMain: false,
        order: 3,
      },
    ],
    description: {
      short: `Modernes ${category} mit ${sleepingPlaces} Schlafplätzen und hochwertiger Ausstattung für unvergessliche Reisen.`,
      long: `Erleben Sie Freiheit und Komfort mit diesem wunderschönen ${brand} ${model} aus dem Jahr ${year}.

      Dieses ${category} bietet Platz für bis zu ${seats} Personen zum Fahren und ${sleepingPlaces} komfortable Schlafplätze.
      Die vollständig ausgestattete Küche mit Kühlschrank und Herd ermöglicht es Ihnen, unterwegs zu kochen.
      ${category !== 'Kastenwagen' ? 'Das geräumige Bad mit Dusche und WC sorgt für zusätzlichen Komfort.' : ''}

      Perfekt für Familienurlaube, Roadtrips mit Freunden oder romantische Ausflüge zu zweit. Das Fahrzeug ist in einem
      ausgezeichneten Zustand, regelmäßig gewartet und vollständig versichert. Alle notwendigen Utensilien für einen
      gelungenen Urlaub sind bereits an Bord.

      Genießen Sie die Freiheit, dorthin zu fahren, wohin Sie möchten, und gleichzeitig den Komfort eines gemütlichen Zuhauses
      zu haben. Buchen Sie jetzt und starten Sie Ihr Abenteuer!`,
      highlights: [
        `${sleepingPlaces} Schlafplätze`,
        `${seats} Sitzplätze`,
        'Vollausgestattete Küche',
        category !== 'Kastenwagen' ? 'Bad mit Dusche' : 'Kompakt & wendig',
        'Klimaanlage',
        'Rückfahrkamera',
      ],
    },
    location: {
      address: {
        street: `Musterstraße ${randomInt(1, 99)}`,
        city,
        state: 'Nordrhein-Westfalen',
        postalCode: `${randomInt(40000, 59999)}`,
        country: 'Deutschland',
      },
      coordinates: {
        lat: 51.5 + Math.random() * 2,
        lng: 7.0 + Math.random() * 2,
      },
      pickupInstructions: 'Bitte melden Sie sich 30 Minuten vor der vereinbarten Abholzeit. Parkmöglichkeiten sind vorhanden.',
    },
    availability: {
      isAvailable: true,
      minimumRental: randomChoice([2, 3, 5]),
      maximumRental: 30,
      advanceBooking: {
        minimum: 2,
        maximum: 365,
      },
    },
    rules: {
      minAge: randomChoice([21, 23, 25]),
      maxAge: 75,
      smokingAllowed: false,
      petsAllowed: randomBool(0.3),
      festivalsAllowed: randomBool(0.6),
      foreignTravelAllowed: true,
      allowedCountries: ['Deutschland', 'Österreich', 'Schweiz', 'Frankreich', 'Italien', 'Niederlande', 'Belgien'],
      cancellationPolicy: randomChoice(['flexibel', 'moderat', 'streng']),
    },
    owner: ownerId,
    statistics: {
      views: randomInt(50, 500),
      bookings: randomInt(5, 50),
      revenue: randomInt(5000, 50000),
      rating: {
        average: parseFloat((randomInt(38, 50) / 10).toFixed(1)),
        count: randomInt(5, 40),
      },
    },
    status: 'aktiv',
    featured: randomBool(0.3),
    verificationStatus: 'genehmigt',
  };
}

async function addVehicles() {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGO_URI);
    console.log('✅ Connected to MongoDB Atlas');

    // Find or create a user to be the owner
    let owner = await User.findOne();

    if (!owner) {
      console.log('No users found, creating admin user...');
      const bcrypt = require('bcrypt');
      const hashedPassword = await bcrypt.hash('Admin@2024#Secure', 10);

      owner = await User.create({
        firstName: 'Admin',
        lastName: 'User',
        email: 'admin@fairmietung.de',
        password: hashedPassword,
        role: 'admin',
        isEmailVerified: true,
      });
      console.log('✅ Admin user created');
    }

    console.log(`📋 Using owner: ${owner.email} (${owner._id})`);

    // Generate and insert 20 vehicles (one by one to trigger pre-save hooks)
    const result = [];
    const categoryCount = {};

    console.log('\n🚀 Creating vehicles...');
    for (let i = 0; i < 20; i++) {
      const vehicleData = generateVehicle(owner._id, i);
      const vehicle = new Vehicle(vehicleData);
      await vehicle.save();
      result.push(vehicle);

      categoryCount[vehicle.category] = (categoryCount[vehicle.category] || 0) + 1;
      process.stdout.write(`   ✓ Created ${i + 1}/20: ${vehicle.name}\n`);
    }

    console.log(`\n✅ Successfully added ${result.length} vehicles to the database!`);

    // Display summary
    console.log('\n📊 Vehicle Summary:');
    Object.entries(categoryCount).forEach(([category, count]) => {
      console.log(`   ${category}: ${count}`);
    });

    console.log('\n🎉 All done! Your database now has 20 random vehicles.');

    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error.message);
    console.error(error);
    process.exit(1);
  }
}

// Run the script
addVehicles();
