import { useState, useEffect, useCallback } from "react";
import { Link, useSearchParams } from "react-router-dom";
import {
  Button,
  TextInput,
  Select,
  Pagination,
  Checkbox,
  Label,
  RangeSlider,
  Badge,
  Card,
} from "flowbite-react";
import {
  HiSearch,
  HiFilter,
  HiArrowCircleRight,
  HiLocationMarker,
  HiAdjustments,
  HiStar,
  HiX,
  HiViewGrid,
  HiViewList,
  HiTruck,
  HiUsers,
  HiHome,
} from "react-icons/hi";
import Skeleton from "react-loading-skeleton";
import "react-loading-skeleton/dist/skeleton.css";
import { vehicleService } from "../services/api";
import {
  getVehicleImage,
  formatCurrency,
  getLocationLabel,
  FALLBACK_IMAGES,
} from "../utils/vehicleHelpers";

const PAGINATION_LIMIT = 9;

const FEATURE_OPTIONS = [
  { value: "climate.airConditioning", label: "Klimaanlage", icon: "❄️" },
  { value: "climate.heating", label: "Standheizung", icon: "🔥" },
  { value: "outdoor.awning", label: "Markise", icon: "⛱️" },
  { value: "outdoor.bikeRack", label: "Fahrradträger", icon: "🚴" },
  { value: "entertainment.wifi", label: "WLAN", icon: "📶" },
  { value: "power.solarPanel", label: "Solaranlage", icon: "☀️" },
  { value: "kitchen.available", label: "Küche", icon: "🍳" },
  { value: "bathroom.available", label: "Bad/WC", icon: "🚿" },
];

const CATEGORY_OPTIONS = [
  { value: "", label: "Alle Kategorien" },
  { value: "Wohnmobil", label: "Wohnmobil" },
  { value: "Kastenwagen", label: "Kastenwagen" },
  { value: "Wohnwagen", label: "Wohnwagen" },
];

const SORT_OPTIONS = [
  { value: "popular", label: "Beliebtheit" },
  { value: "price-asc", label: "Preis aufsteigend" },
  { value: "price-desc", label: "Preis absteigend" },
  { value: "rating", label: "Beste Bewertung" },
  { value: "newest", label: "Neueste zuerst" },
];

const VehicleSkeletonCard = () => (
  <div className="overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-lg">
    <Skeleton
      height={240}
      className="w-full"
      baseColor="#f3f4f6"
      highlightColor="#e5e7eb"
    />
    <div className="space-y-4 p-6">
      <Skeleton height={28} width="70%" />
      <Skeleton height={18} width="45%" />
      <div className="grid grid-cols-2 gap-3">
        {Array.from({ length: 4 }).map((_, index) => (
          <Skeleton key={`vehicle-skeleton-${index}`} height={20} />
        ))}
      </div>
      <Skeleton height={36} width="55%" />
    </div>
  </div>
);

const getInitialFilters = (params) => ({
  category: params.get("category") || "",
  minPrice: params.get("minPrice") || "",
  maxPrice: params.get("maxPrice") || "",
  seats: params.get("seats") || "",
  sleepingPlaces: params.get("sleepingPlaces") || "",
  location: params.get("location") || "",
});

const VehicleListPage = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [filters, setFilters] = useState(() => getInitialFilters(searchParams));
  const [selectedFeatures, setSelectedFeatures] = useState(() => {
    const featuresParam = searchParams.get("features");
    return featuresParam ? featuresParam.split(",").filter(Boolean) : [];
  });
  const [sortBy, setSortBy] = useState(searchParams.get("sortBy") || "popular");
  const [currentPage, setCurrentPage] = useState(
    parseInt(searchParams.get("page") || "1", 10) || 1
  );
  const [viewMode, setViewMode] = useState("grid");
  const [showFilters, setShowFilters] = useState(true);
  const [priceRange, setPriceRange] = useState([0, 500]);

  const [vehicles, setVehicles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [totalPages, setTotalPages] = useState(1);
  const [totalResults, setTotalResults] = useState(0);

  const fetchVehicles = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const params = {};

      // Add filters
      if (filters.category) params.category = filters.category;
      if (filters.minPrice) params.minPrice = filters.minPrice;
      if (filters.maxPrice) params.maxPrice = filters.maxPrice;
      if (filters.seats) params.seats = filters.seats;
      if (filters.sleepingPlaces) params.sleepingPlaces = filters.sleepingPlaces;
      if (filters.location) params.location = filters.location;

      // Add features
      if (selectedFeatures.length > 0) {
        params.features = selectedFeatures.join(",");
      }

      // Add pagination and sorting
      params.limit = PAGINATION_LIMIT;
      params.page = currentPage;
      params.sortBy = sortBy;

      console.log("Fetching vehicles with params:", params);

      const response = await vehicleService.getAllVehicles(params);
      const payload = response?.data?.data ?? {};
      const vehiclesData = Array.isArray(payload?.vehicles)
        ? payload.vehicles
        : [];

      // Get total from pagination object (backend returns it there)
      const total = payload?.pagination?.total || payload?.total || vehiclesData.length;
      const totalPagesFromBackend = payload?.pagination?.pages || Math.ceil(total / PAGINATION_LIMIT);

      console.log("Received vehicles:", vehiclesData.length, "Total:", total, "Pages:", totalPagesFromBackend);

      setVehicles(vehiclesData);
      setTotalResults(total);
      setTotalPages(totalPagesFromBackend);
    } catch (err) {
      console.error("Error fetching vehicles:", err);
      setError(
        "Fehler beim Laden der Fahrzeuge. Bitte versuchen Sie es später erneut."
      );
    } finally {
      setLoading(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentPage, sortBy]);

  useEffect(() => {
    fetchVehicles();
  }, [currentPage, sortBy, fetchVehicles]);

  const handlePageChange = (page) => {
    setCurrentPage(page);
    const newParams = new URLSearchParams(searchParams);
    newParams.set("page", page.toString());
    setSearchParams(newParams);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleSearch = () => {
    const newParams = new URLSearchParams();

    Object.entries(filters).forEach(([key, value]) => {
      if (value) newParams.set(key, value);
    });

    if (selectedFeatures.length > 0) {
      newParams.set("features", selectedFeatures.join(","));
    }

    newParams.set("sortBy", sortBy);
    newParams.set("page", "1");

    setSearchParams(newParams);
    setCurrentPage(1);

    // Trigger fetch manually
    setTimeout(() => {
      fetchVehicles();
    }, 100);
  };

  const handleSortChange = (newSort) => {
    setSortBy(newSort);
    const newParams = new URLSearchParams(searchParams);
    newParams.set("sortBy", newSort);
    newParams.set("page", "1");
    setSearchParams(newParams);
    setCurrentPage(1);
  };

  const handleFeatureToggle = (feature) => {
    setSelectedFeatures((prev) =>
      prev.includes(feature)
        ? prev.filter((f) => f !== feature)
        : [...prev, feature]
    );
  };

  const clearFilters = () => {
    setFilters(getInitialFilters(new URLSearchParams()));
    setSelectedFeatures([]);
    setPriceRange([0, 500]);
    setSortBy("popular");
    setCurrentPage(1);
    setSearchParams(new URLSearchParams());

    // Trigger fetch manually after clearing
    setTimeout(() => {
      fetchVehicles();
    }, 100);
  };

  const removeFilter = (filterKey) => {
    const newFilters = { ...filters, [filterKey]: "" };
    setFilters(newFilters);
    const newParams = new URLSearchParams(searchParams);
    newParams.delete(filterKey);
    setSearchParams(newParams);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section - Primary Green */}
      <section className="bg-gradient-to-r from-primary-600 to-primary-700 text-white py-20">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl">
            <h1 className="text-5xl font-black mb-4">Unsere Fahrzeugflotte</h1>
            <p className="text-xl opacity-95 mb-6">
              Finden Sie das perfekte Wohnmobil für Ihre Traumreise
            </p>
            <div className="flex items-center gap-4 flex-wrap">
              <div className="bg-white/20 backdrop-blur-sm rounded-full px-6 py-3 flex items-center gap-2">
                <HiTruck className="h-5 w-5" />
                <span className="font-semibold">{totalResults} Fahrzeuge verfügbar</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      <div className="container mx-auto px-4 py-8">
        <div className="flex gap-8">
          {/* Filters Sidebar */}
          <aside
            className={`${
              showFilters ? "w-80" : "w-0"
            } transition-all duration-300 overflow-hidden`}
          >
            <Card className="sticky top-24 border-2 border-primary-100">
              <div className="space-y-6">
                {/* Filter Header */}
                <div className="flex items-center justify-between">
                  <h3 className="text-xl font-bold flex items-center gap-2 text-gray-900">
                    <HiFilter className="h-6 w-6 text-primary-500" />
                    Filter
                  </h3>
                  <Button
                    size="xs"
                    color="light"
                    onClick={clearFilters}
                    className="text-red-600 hover:text-red-700 hover:bg-red-50"
                  >
                    <HiX className="h-4 w-4 mr-1" />
                    Zurücksetzen
                  </Button>
                </div>

                {/* Category Filter */}
                <div>
                  <Label htmlFor="category" className="mb-2 font-semibold text-gray-700">
                    Fahrzeugtyp
                  </Label>
                  <Select
                    id="category"
                    value={filters.category}
                    onChange={(e) =>
                      setFilters({ ...filters, category: e.target.value })
                    }
                    className="focus:ring-primary-500 focus:border-primary-500"
                  >
                    {CATEGORY_OPTIONS.map((option) => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </Select>
                </div>

                {/* Price Range */}
                <div>
                  <Label className="mb-3 font-semibold text-gray-700">
                    Preis pro Tag: €{priceRange[0]} - €{priceRange[1]}
                  </Label>
                  <div className="space-y-4">
                    <div>
                      <label className="text-sm text-gray-600">Min: €{priceRange[0]}</label>
                      <RangeSlider
                        min={0}
                        max={500}
                        value={priceRange[0]}
                        onChange={(e) => {
                          const value = parseInt(e.target.value);
                          if (value <= priceRange[1]) {
                            setPriceRange([value, priceRange[1]]);
                            setFilters({ ...filters, minPrice: value.toString() });
                          }
                        }}
                        className="text-primary-500"
                      />
                    </div>
                    <div>
                      <label className="text-sm text-gray-600">Max: €{priceRange[1]}</label>
                      <RangeSlider
                        min={0}
                        max={500}
                        value={priceRange[1]}
                        onChange={(e) => {
                          const value = parseInt(e.target.value);
                          if (value >= priceRange[0]) {
                            setPriceRange([priceRange[0], value]);
                            setFilters({ ...filters, maxPrice: value.toString() });
                          }
                        }}
                        className="text-primary-500"
                      />
                    </div>
                  </div>
                </div>

                {/* Capacity Filters */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="seats" className="mb-2 font-semibold text-gray-700">
                      <HiUsers className="inline h-4 w-4 mr-1" />
                      Sitzplätze
                    </Label>
                    <TextInput
                      id="seats"
                      type="number"
                      min="1"
                      max="10"
                      value={filters.seats}
                      onChange={(e) =>
                        setFilters({ ...filters, seats: e.target.value })
                      }
                      placeholder="Min."
                      className="focus:ring-primary-500 focus:border-primary-500"
                    />
                  </div>
                  <div>
                    <Label htmlFor="sleepingPlaces" className="mb-2 font-semibold text-gray-700">
                      <HiHome className="inline h-4 w-4 mr-1" />
                      Schlafplätze
                    </Label>
                    <TextInput
                      id="sleepingPlaces"
                      type="number"
                      min="1"
                      max="10"
                      value={filters.sleepingPlaces}
                      onChange={(e) =>
                        setFilters({
                          ...filters,
                          sleepingPlaces: e.target.value,
                        })
                      }
                      placeholder="Min."
                      className="focus:ring-primary-500 focus:border-primary-500"
                    />
                  </div>
                </div>

                {/* Location Filter */}
                <div>
                  <Label htmlFor="location" className="mb-2 font-semibold text-gray-700">
                    <HiLocationMarker className="inline h-4 w-4 mr-1" />
                    Standort
                  </Label>
                  <TextInput
                    id="location"
                    value={filters.location}
                    onChange={(e) =>
                      setFilters({ ...filters, location: e.target.value })
                    }
                    placeholder="Stadt oder PLZ"
                    icon={HiLocationMarker}
                    className="focus:ring-primary-500 focus:border-primary-500"
                  />
                </div>

                {/* Features */}
                <div>
                  <Label className="mb-3 font-semibold text-gray-700">Ausstattung</Label>
                  <div className="space-y-2 max-h-64 overflow-y-auto pr-2">
                    {FEATURE_OPTIONS.map((feature) => (
                      <div key={feature.value} className="flex items-center hover:bg-gray-50 p-2 rounded-lg transition-colors">
                        <Checkbox
                          id={feature.value}
                          checked={selectedFeatures.includes(feature.value)}
                          onChange={() => handleFeatureToggle(feature.value)}
                          className="text-primary-500 focus:ring-primary-500"
                        />
                        <Label
                          htmlFor={feature.value}
                          className="ml-2 flex items-center gap-2 cursor-pointer flex-1"
                        >
                          <span className="text-lg">{feature.icon}</span>
                          <span className="text-sm">{feature.label}</span>
                        </Label>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Apply Filters Button */}
                <Button
                  className="w-full bg-primary-500 hover:bg-primary-600 text-white font-semibold"
                  onClick={handleSearch}
                >
                  <HiSearch className="h-5 w-5 mr-2" />
                  Filter anwenden
                </Button>
              </div>
            </Card>
          </aside>

          {/* Main Content */}
          <div className="flex-1">
            {/* Controls Bar */}
            <div className="bg-white rounded-2xl shadow-sm p-6 mb-6 border border-gray-100">
              <div className="flex items-center justify-between flex-wrap gap-4">
                <div className="flex items-center gap-4">
                  <Button
                    size="sm"
                    color="light"
                    onClick={() => setShowFilters(!showFilters)}
                    className="border-2 border-gray-200 hover:border-primary-500 hover:text-primary-600"
                  >
                    <HiAdjustments className="h-5 w-5 mr-2" />
                    {showFilters ? "Filter ausblenden" : "Filter anzeigen"}
                  </Button>

                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium text-gray-700">Ansicht:</span>
                    <Button
                      size="sm"
                      color={viewMode === "grid" ? "success" : "light"}
                      onClick={() => setViewMode("grid")}
                      className={viewMode === "grid" ? "bg-primary-500 hover:bg-primary-600" : ""}
                    >
                      <HiViewGrid className="h-5 w-5" />
                    </Button>
                    <Button
                      size="sm"
                      color={viewMode === "list" ? "success" : "light"}
                      onClick={() => setViewMode("list")}
                      className={viewMode === "list" ? "bg-primary-500 hover:bg-primary-600" : ""}
                    >
                      <HiViewList className="h-5 w-5" />
                    </Button>
                  </div>
                </div>

                <div className="flex items-center gap-4">
                  <span className="text-sm font-medium text-gray-700">
                    {totalResults} Ergebnisse
                  </span>
                  <Select
                    value={sortBy}
                    onChange={(e) => handleSortChange(e.target.value)}
                    className="w-56 focus:ring-primary-500 focus:border-primary-500"
                  >
                    {SORT_OPTIONS.map((option) => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </Select>
                </div>
              </div>

              {/* Active Filters */}
              {(selectedFeatures.length > 0 ||
                filters.category ||
                filters.location ||
                filters.seats ||
                filters.sleepingPlaces) && (
                <div className="mt-4 pt-4 border-t border-gray-200 flex flex-wrap gap-2">
                  {filters.category && (
                    <Badge color="success" className="px-3 py-1.5 bg-primary-100 text-primary-700">
                      {filters.category}
                      <button
                        onClick={() => removeFilter("category")}
                        className="ml-2 hover:text-primary-900"
                      >
                        <HiX className="h-3 w-3" />
                      </button>
                    </Badge>
                  )}
                  {filters.location && (
                    <Badge color="success" className="px-3 py-1.5 bg-primary-100 text-primary-700">
                      📍 {filters.location}
                      <button
                        onClick={() => removeFilter("location")}
                        className="ml-2 hover:text-primary-900"
                      >
                        <HiX className="h-3 w-3" />
                      </button>
                    </Badge>
                  )}
                  {filters.seats && (
                    <Badge color="success" className="px-3 py-1.5 bg-primary-100 text-primary-700">
                      <HiUsers className="h-3 w-3 mr-1" />
                      {filters.seats}+ Sitzplätze
                      <button
                        onClick={() => removeFilter("seats")}
                        className="ml-2 hover:text-primary-900"
                      >
                        <HiX className="h-3 w-3" />
                      </button>
                    </Badge>
                  )}
                  {filters.sleepingPlaces && (
                    <Badge color="success" className="px-3 py-1.5 bg-primary-100 text-primary-700">
                      <HiHome className="h-3 w-3 mr-1" />
                      {filters.sleepingPlaces}+ Schlafplätze
                      <button
                        onClick={() => removeFilter("sleepingPlaces")}
                        className="ml-2 hover:text-primary-900"
                      >
                        <HiX className="h-3 w-3" />
                      </button>
                    </Badge>
                  )}
                  {selectedFeatures.map((feature) => {
                    const featureObj = FEATURE_OPTIONS.find(
                      (f) => f.value === feature
                    );
                    return (
                      <Badge key={feature} color="success" className="px-3 py-1.5 bg-primary-100 text-primary-700">
                        {featureObj?.icon} {featureObj?.label}
                        <button
                          onClick={() => handleFeatureToggle(feature)}
                          className="ml-2 hover:text-primary-900"
                        >
                          <HiX className="h-3 w-3" />
                        </button>
                      </Badge>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Vehicles Grid/List */}
            {loading ? (
              <div
                className={`grid ${
                  viewMode === "grid"
                    ? "grid-cols-1 md:grid-cols-2 lg:grid-cols-3"
                    : "grid-cols-1"
                } gap-6`}
              >
                {[...Array(6)].map((_, index) => (
                  <VehicleSkeletonCard key={index} />
                ))}
              </div>
            ) : error ? (
              <div className="text-center py-12 bg-white rounded-2xl">
                <p className="text-red-600 mb-4">{error}</p>
                <Button onClick={fetchVehicles} className="bg-primary-500 hover:bg-primary-600">
                  Erneut versuchen
                </Button>
              </div>
            ) : vehicles.length === 0 ? (
              <div className="text-center py-16 bg-white rounded-2xl border-2 border-gray-100">
                <HiSearch className="h-20 w-20 text-gray-300 mx-auto mb-4" />
                <h3 className="text-2xl font-bold text-gray-900 mb-2">
                  Keine Fahrzeuge gefunden
                </h3>
                <p className="text-gray-600 mb-6">
                  Versuchen Sie, Ihre Filterkriterien anzupassen
                </p>
                <Button onClick={clearFilters} className="bg-primary-500 hover:bg-primary-600 text-white">
                  Filter zurücksetzen
                </Button>
              </div>
            ) : (
              <>
                <div
                  className={`grid ${
                    viewMode === "grid"
                      ? "grid-cols-1 md:grid-cols-2 lg:grid-cols-3"
                      : "grid-cols-1"
                  } gap-6`}
                >
                  {vehicles.map((vehicle) => {
                    const imageUrl = getVehicleImage(vehicle);
                    const locationLabel = getLocationLabel(vehicle);
                    const basePrice = vehicle?.pricing?.basePrice?.perDay || 0;
                    const rating = vehicle?.statistics?.rating?.average || 0;
                    const reviewCount = vehicle?.statistics?.rating?.count || 0;

                    return viewMode === "grid" ? (
                      // Grid View Card
                      <div
                        key={vehicle._id}
                        className="group bg-white rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 overflow-hidden border border-gray-100 hover:border-primary-200"
                      >
                        <div className="relative h-56 overflow-hidden">
                          <img
                            src={imageUrl}
                            alt={vehicle.name}
                            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                            onError={(e) => {
                              e.target.onerror = null;
                              e.target.src = FALLBACK_IMAGES[0];
                            }}
                          />
                          {vehicle.featured && (
                            <Badge
                              color="warning"
                              className="absolute top-3 left-3 shadow-lg"
                            >
                              ⭐ Premium
                            </Badge>
                          )}
                        </div>

                        <div className="p-5">
                          <h3 className="text-lg font-bold text-gray-900 mb-2 group-hover:text-primary-600 transition-colors">
                            {vehicle.name}
                          </h3>

                          <div className="flex items-center text-sm text-gray-600 mb-3">
                            <HiLocationMarker className="h-4 w-4 mr-1 text-primary-500" />
                            {locationLabel}
                          </div>

                          {rating > 0 && (
                            <div className="flex items-center gap-1 mb-3">
                              {[...Array(5)].map((_, i) => (
                                <HiStar
                                  key={i}
                                  className={`h-4 w-4 ${
                                    i < Math.floor(rating)
                                      ? "text-yellow-400"
                                      : "text-gray-300"
                                  }`}
                                />
                              ))}
                              <span className="text-sm text-gray-600 ml-1">
                                ({reviewCount})
                              </span>
                            </div>
                          )}

                          <div className="flex flex-wrap gap-2 mb-4">
                            {vehicle?.capacity?.seats && (
                              <Badge color="gray" size="sm" className="bg-gray-100">
                                <HiUsers className="h-3 w-3 mr-1" />
                                {vehicle.capacity.seats}
                              </Badge>
                            )}
                            {vehicle?.capacity?.sleepingPlaces && (
                              <Badge color="gray" size="sm" className="bg-gray-100">
                                <HiHome className="h-3 w-3 mr-1" />
                                {vehicle.capacity.sleepingPlaces}
                              </Badge>
                            )}
                            {vehicle?.category && (
                              <Badge color="gray" size="sm" className="bg-gray-100">
                                {vehicle.category}
                              </Badge>
                            )}
                          </div>

                          <div className="flex items-center justify-between pt-4 border-t border-gray-100">
                            <div>
                              <p className="text-xs text-gray-500">ab</p>
                              <p className="text-xl font-bold text-primary-600">
                                {formatCurrency(basePrice)}
                                <span className="text-sm text-gray-500 font-normal">
                                  /Tag
                                </span>
                              </p>
                            </div>
                            <Button
                              size="sm"
                              as={Link}
                              to={`/vehicles/${vehicle.slug || vehicle._id}`}
                              className="bg-primary-500 hover:bg-primary-600 text-white"
                            >
                              Details
                              <HiArrowCircleRight className="ml-2 h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                      </div>
                    ) : (
                      // List View Card
                      <Card className="hover:shadow-xl transition-shadow border border-gray-100 hover:border-primary-200">
                        <div className="flex gap-6">
                          <img
                            src={imageUrl}
                            alt={vehicle.name}
                            className="w-64 h-48 object-cover rounded-xl"
                            onError={(e) => {
                              e.target.onerror = null;
                              e.target.src = FALLBACK_IMAGES[0];
                            }}
                          />
                          <div className="flex-1">
                            <div className="flex justify-between items-start mb-3">
                              <div>
                                <h3 className="text-xl font-bold text-gray-900 hover:text-primary-600 transition-colors">
                                  {vehicle.name}
                                </h3>
                                <p className="text-gray-600 flex items-center mt-1">
                                  <HiLocationMarker className="h-4 w-4 mr-1 text-primary-500" />
                                  {locationLabel}
                                </p>
                              </div>
                              {vehicle.featured && (
                                <Badge color="warning">⭐ Premium</Badge>
                              )}
                            </div>

                            <p className="text-gray-700 mb-3 line-clamp-2">
                              {vehicle?.description?.short ||
                                vehicle?.description?.long ||
                                "Perfekt für Ihre nächste Reise"}
                            </p>

                            <div className="flex flex-wrap gap-3 mb-4">
                              {vehicle?.capacity?.seats && (
                                <Badge color="gray" className="bg-gray-100">
                                  <HiUsers className="h-4 w-4 mr-1" />
                                  {vehicle.capacity.seats} Sitzplätze
                                </Badge>
                              )}
                              {vehicle?.capacity?.sleepingPlaces && (
                                <Badge color="gray" className="bg-gray-100">
                                  <HiHome className="h-4 w-4 mr-1" />
                                  {vehicle.capacity.sleepingPlaces} Schlafplätze
                                </Badge>
                              )}
                              {vehicle?.technicalData?.transmission && (
                                <Badge color="gray" className="bg-gray-100">
                                  {vehicle.technicalData.transmission}
                                </Badge>
                              )}
                            </div>

                            <div className="flex items-center justify-between">
                              <div className="flex items-baseline gap-2">
                                <span className="text-sm text-gray-500">
                                  ab
                                </span>
                                <span className="text-2xl font-bold text-primary-600">
                                  {formatCurrency(basePrice)}
                                </span>
                                <span className="text-gray-500">pro Tag</span>
                              </div>
                              <Button
                                as={Link}
                                to={`/vehicles/${vehicle.slug || vehicle._id}`}
                                className="bg-primary-500 hover:bg-primary-600 text-white"
                              >
                                Details ansehen
                                <HiArrowCircleRight className="ml-2 h-5 w-5" />
                              </Button>
                            </div>
                          </div>
                        </div>
                      </Card>
                    );
                  })}
                </div>

                {/* Pagination - Fixed */}
                {totalPages > 1 && (
                  <div className="flex justify-center mt-10">
                    <Pagination
                      currentPage={currentPage}
                      totalPages={totalPages}
                      onPageChange={handlePageChange}
                      showIcons
                      previousLabel="Zurück"
                      nextLabel="Weiter"
                      className="pagination-primary"
                    />
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default VehicleListPage;
