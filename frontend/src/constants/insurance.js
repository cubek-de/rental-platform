// Insurance packages for rental platform (Frontend)

export const INSURANCE_PACKAGES = {
  basic: {
    id: 'basic',
    name: 'Basis-Versicherung',
    nameEn: 'Basic Insurance',
    description: 'Grundlegende Absicherung mit Selbstbeteiligung',
    descriptionEn: 'Basic coverage with deductible',
    price: 15, // €15 per day
    deductible: 1500, // €1500 deductible
    coverage: {
      liability: 1000000,
      collision: true,
      theft: true,
      fire: true,
      glassBreakage: false,
      tiresAndRims: false,
      undercarriage: false,
      interior: false,
    },
    features: [
      'Haftpflichtversicherung (€1.000.000)',
      'Kaskoversicherung (Selbstbeteiligung €1.500)',
      'Diebstahlschutz',
      'Feuerschutz',
    ],
    icon: '🛡️',
    color: 'blue',
  },
  standard: {
    id: 'standard',
    name: 'Standard-Versicherung',
    nameEn: 'Standard Insurance',
    description: 'Erweiterte Absicherung mit reduzierter Selbstbeteiligung',
    descriptionEn: 'Enhanced coverage with reduced deductible',
    price: 25, // €25 per day
    deductible: 750, // €750 deductible
    coverage: {
      liability: 2000000,
      collision: true,
      theft: true,
      fire: true,
      glassBreakage: true,
      tiresAndRims: true,
      undercarriage: false,
      interior: true,
    },
    features: [
      'Haftpflichtversicherung (€2.000.000)',
      'Kaskoversicherung (Selbstbeteiligung €750)',
      'Diebstahlschutz',
      'Feuerschutz',
      'Glasbruchversicherung',
      'Reifen- und Felgenschutz',
      'Innenraumschutz',
    ],
    icon: '🛡️',
    color: 'emerald',
    recommended: true,
  },
  premium: {
    id: 'premium',
    name: 'Premium-Versicherung',
    nameEn: 'Premium Insurance',
    description: 'Vollkasko ohne Selbstbeteiligung - Rundum-Sorglos-Paket',
    descriptionEn: 'Comprehensive coverage with zero deductible',
    price: 45, // €45 per day
    deductible: 0, // No deductible
    coverage: {
      liability: 5000000,
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
      'Haftpflichtversicherung (€5.000.000)',
      'Vollkasko ohne Selbstbeteiligung',
      'Diebstahlschutz',
      'Feuerschutz',
      'Glasbruchversicherung',
      'Reifen- und Felgenschutz',
      'Unterbodenschutz',
      'Innenraumschutz',
      'Persönliche Gegenstände versichert (bis €500)',
      '24/7 Pannenhilfe inklusive',
      'Kostenlose Ersatzfahrzeug bei Ausfall',
    ],
    icon: '🛡️',
    color: 'purple',
    badge: 'Bestseller',
  },
};

// Refund policy
export const REFUND_POLICY = {
  fullRefund: {
    days: 7,
    percentage: 100,
    description: '100% Erstattung bei Stornierung 7+ Tage vor Mietbeginn',
    color: 'green',
  },
  halfRefund: {
    days: 3,
    percentage: 50,
    description: '50% Erstattung bei Stornierung 3-7 Tage vor Mietbeginn',
    color: 'yellow',
  },
  noRefund: {
    days: 0,
    percentage: 0,
    description: 'Keine Erstattung bei Stornierung weniger als 3 Tage vor Mietbeginn',
    color: 'red',
  },
};

// Calculate refund amount based on policy
export const calculateRefundAmount = (totalAmount, daysUntilStart) => {
  let refundPercentage = 0;
  let policy = REFUND_POLICY.noRefund;

  if (daysUntilStart >= REFUND_POLICY.fullRefund.days) {
    refundPercentage = REFUND_POLICY.fullRefund.percentage;
    policy = REFUND_POLICY.fullRefund;
  } else if (daysUntilStart >= REFUND_POLICY.halfRefund.days) {
    refundPercentage = REFUND_POLICY.halfRefund.percentage;
    policy = REFUND_POLICY.halfRefund;
  } else {
    refundPercentage = REFUND_POLICY.noRefund.percentage;
    policy = REFUND_POLICY.noRefund;
  }

  return {
    refundAmount: (totalAmount * refundPercentage) / 100,
    refundPercentage,
    policy,
  };
};

// Get insurance package by type
export const getInsurancePackage = (type) => {
  return INSURANCE_PACKAGES[type] || INSURANCE_PACKAGES.basic;
};

// Calculate insurance price for rental period
export const calculateInsurancePrice = (type, numberOfDays) => {
  const insurance = getInsurancePackage(type);
  return insurance.price * numberOfDays;
};

// Format currency
export const formatCurrency = (amount) => {
  return new Intl.NumberFormat('de-DE', {
    style: 'currency',
    currency: 'EUR',
  }).format(amount);
};

// Calculate days between dates
export const calculateDays = (startDate, endDate) => {
  const start = new Date(startDate);
  const end = new Date(endDate);
  const diffTime = Math.abs(end - start);
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
};
