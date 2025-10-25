// Insurance packages for rental platform

const INSURANCE_PACKAGES = {
  basic: {
    name: "Basis-Versicherung",
    nameEn: "Basic Insurance",
    description: "Grundlegende Absicherung mit Selbstbeteiligung",
    descriptionEn: "Basic coverage with deductible",
    price: 15, // €15 per day
    deductible: 1500, // €1500 deductible
    coverage: {
      liability: 1000000, // €1M liability coverage
      collision: true,
      theft: true,
      fire: true,
      glassBreakage: false,
      tiresAndRims: false,
      undercarriage: false,
      interior: false,
    },
    features: [
      "Haftpflichtversicherung (€1.000.000)",
      "Kaskoversicherung (Selbstbeteiligung €1.500)",
      "Diebstahlschutz",
      "Feuerschutz",
    ],
    featuresEn: [
      "Liability insurance (€1,000,000)",
      "Collision coverage (€1,500 deductible)",
      "Theft protection",
      "Fire protection",
    ],
  },
  standard: {
    name: "Standard-Versicherung",
    nameEn: "Standard Insurance",
    description: "Erweiterte Absicherung mit reduzierter Selbstbeteiligung",
    descriptionEn: "Enhanced coverage with reduced deductible",
    price: 25, // €25 per day
    deductible: 750, // €750 deductible
    coverage: {
      liability: 2000000, // €2M liability coverage
      collision: true,
      theft: true,
      fire: true,
      glassBreakage: true,
      tiresAndRims: true,
      undercarriage: false,
      interior: true,
    },
    features: [
      "Haftpflichtversicherung (€2.000.000)",
      "Kaskoversicherung (Selbstbeteiligung €750)",
      "Diebstahlschutz",
      "Feuerschutz",
      "Glasbruchversicherung",
      "Reifen- und Felgenschutz",
      "Innenraumschutz",
    ],
    featuresEn: [
      "Liability insurance (€2,000,000)",
      "Collision coverage (€750 deductible)",
      "Theft protection",
      "Fire protection",
      "Glass breakage coverage",
      "Tire and rim protection",
      "Interior protection",
    ],
  },
  premium: {
    name: "Premium-Versicherung",
    nameEn: "Premium Insurance",
    description: "Vollkasko ohne Selbstbeteiligung - Rundum-Sorglos-Paket",
    descriptionEn: "Comprehensive coverage with zero deductible - Complete peace of mind",
    price: 45, // €45 per day
    deductible: 0, // No deductible
    coverage: {
      liability: 5000000, // €5M liability coverage
      collision: true,
      theft: true,
      fire: true,
      glassBreakage: true,
      tiresAndRims: true,
      undercarriage: true,
      interior: true,
      personalBelongings: true,
      roadside: true,
    },
    features: [
      "Haftpflichtversicherung (€5.000.000)",
      "Vollkasko ohne Selbstbeteiligung",
      "Diebstahlschutz",
      "Feuerschutz",
      "Glasbruchversicherung",
      "Reifen- und Felgenschutz",
      "Unterbodenschutz",
      "Innenraumschutz",
      "Persönliche Gegenstände versichert (bis €500)",
      "24/7 Pannenhilfe inklusive",
      "Kostenlose Ersatzfahrzeug bei Ausfall",
    ],
    featuresEn: [
      "Liability insurance (€5,000,000)",
      "Comprehensive coverage with zero deductible",
      "Theft protection",
      "Fire protection",
      "Glass breakage coverage",
      "Tire and rim protection",
      "Undercarriage protection",
      "Interior protection",
      "Personal belongings insured (up to €500)",
      "24/7 roadside assistance included",
      "Free replacement vehicle in case of breakdown",
    ],
  },
};

// Refund policy based on cancellation time
const REFUND_POLICY = {
  fullRefund: {
    days: 7,
    percentage: 100,
    description: "100% Erstattung bei Stornierung 7+ Tage vor Mietbeginn",
    descriptionEn: "100% refund for cancellations 7+ days before rental start",
  },
  halfRefund: {
    days: 3,
    percentage: 50,
    description: "50% Erstattung bei Stornierung 3-7 Tage vor Mietbeginn",
    descriptionEn: "50% refund for cancellations 3-7 days before rental start",
  },
  noRefund: {
    days: 0,
    percentage: 0,
    description: "Keine Erstattung bei Stornierung weniger als 3 Tage vor Mietbeginn",
    descriptionEn: "No refund for cancellations less than 3 days before rental start",
  },
};

// Calculate refund amount based on policy
const calculateRefundAmount = (totalAmount, daysUntilStart) => {
  let refundPercentage = 0;

  if (daysUntilStart >= REFUND_POLICY.fullRefund.days) {
    refundPercentage = REFUND_POLICY.fullRefund.percentage;
  } else if (daysUntilStart >= REFUND_POLICY.halfRefund.days) {
    refundPercentage = REFUND_POLICY.halfRefund.percentage;
  } else {
    refundPercentage = REFUND_POLICY.noRefund.percentage;
  }

  return {
    refundAmount: (totalAmount * refundPercentage) / 100,
    refundPercentage,
    policy: Object.values(REFUND_POLICY).find(
      (p) => p.percentage === refundPercentage
    ),
  };
};

// Get insurance package by type
const getInsurancePackage = (type) => {
  return INSURANCE_PACKAGES[type] || INSURANCE_PACKAGES.basic;
};

// Calculate insurance price for rental period
const calculateInsurancePrice = (type, numberOfDays) => {
  const insurance = getInsurancePackage(type);
  return insurance.price * numberOfDays;
};

module.exports = {
  INSURANCE_PACKAGES,
  REFUND_POLICY,
  calculateRefundAmount,
  getInsurancePackage,
  calculateInsurancePrice,
};
