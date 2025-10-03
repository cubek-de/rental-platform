import placeholderVehicle from "../assets/vehicle-placeholder.svg";

const FALLBACK_VEHICLE_IMAGES = [
  placeholderVehicle,
  "https://images.unsplash.com/photo-1526382551041-3c817fc3d478?auto=format&fit=crop&w=1200&q=80",
  "https://images.unsplash.com/photo-1521093470119-a3acdc43374c?auto=format&fit=crop&w=1200&q=80",
  "https://images.unsplash.com/photo-1542362567-b07e54358753?auto=format&fit=crop&w=1200&q=80",
  "https://images.unsplash.com/photo-1547841243-eacb14453cd1?auto=format&fit=crop&w=1200&q=80",
  "https://images.unsplash.com/photo-1556761175-4b46a572b786?auto=format&fit=crop&w=1200&q=80",
  "https://images.unsplash.com/photo-1489515217757-5fd1be406fef?auto=format&fit=crop&w=1200&q=80",
  "https://images.unsplash.com/photo-1519817914152-22d216bb9170?auto=format&fit=crop&w=1200&q=80",
];

const hashStringToIndex = (value) => {
  if (!value) return 0;
  let hash = 0;
  for (let i = 0; i < value.length; i += 1) {
    hash = (hash << 5) - hash + value.charCodeAt(i);
    hash |= 0; // Convert to 32bit integer
  }
  return Math.abs(hash);
};

export const getVehicleImage = (vehicle, indexFallback = 0) => {
  const gallery = vehicle?.images ?? [];
  const candidate = gallery.find((image) => Boolean(image?.url));

  if (candidate) {
    return candidate.url;
  }

  const seed =
    vehicle?._id || vehicle?.slug || vehicle?.name || String(indexFallback);
  const fallbackIndex =
    hashStringToIndex(seed) % FALLBACK_VEHICLE_IMAGES.length;

  return FALLBACK_VEHICLE_IMAGES[fallbackIndex];
};

export const formatCurrency = (value, { minimumFractionDigits = 0 } = {}) => {
  if (value === undefined || value === null) {
    return null;
  }

  const numericValue = Number(value);

  if (!Number.isFinite(numericValue)) {
    return null;
  }

  return new Intl.NumberFormat("de-DE", {
    style: "currency",
    currency: "EUR",
    minimumFractionDigits,
    maximumFractionDigits: minimumFractionDigits,
  }).format(numericValue);
};

export const getLocationLabel = (vehicle) => {
  const { city, state, country } = vehicle?.location?.address || {};

  if (city && state) return `${city}, ${state}`;
  if (city) return city;
  if (state) return state;
  return country || "Deutschland";
};

export const FALLBACK_IMAGES = FALLBACK_VEHICLE_IMAGES;
