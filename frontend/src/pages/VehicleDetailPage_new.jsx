import { useState, useEffect, useMemo } from "react";
import { useParams, Link } from "react-router-dom";
import {
  Button,
  Card,
  Badge,
  Avatar,
  Spinner,
  Rating,
  Alert,
  Tabs,
} from "flowbite-react";
import {
  HiLocationMarker,
  HiStar,
  HiUserGroup,
  HiHome,
  HiCalendar,
  HiCurrencyEuro,
  HiShieldCheck,
  HiArrowsExpand,
  HiCheckCircle,
  HiExclamationCircle,
  HiClock,
  HiWifi,
  HiOutlineSparkles,
  HiHeart,
  HiShare,
  HiPhone,
  HiMail,
  HiCamera,
  HiPlay,
  HiChevronLeft,
  HiChevronRight,
} from "react-icons/hi";
import { vehicleService } from "../services/api";
import {
  getVehicleImage,
  formatCurrency,
  getLocationLabel,
  FALLBACK_IMAGES,
} from "../utils/vehicleHelpers";

const VehicleDetailPage = () => {
  const { slug } = useParams();
  const [vehicle, setVehicle] = useState(null);
  const [bookedDates, setBookedDates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [availabilityStatus, setAvailabilityStatus] = useState({
    checked: false,
    available: false,
    loading: false,
    message: null,
  });
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [isImageModalOpen, setIsImageModalOpen] = useState(false);

  useEffect(() => {
    const fetchVehicleDetails = async () => {
      setLoading(true);
      setError(null);
      try {
        const response = await vehicleService.getVehicle(slug);
        const payload = response?.data?.data ?? {};
        const vehicleData = payload?.vehicle || payload;

        if (!vehicleData) {
          setError("Das Fahrzeug konnte nicht geladen werden.");
          setVehicle(null);
          return;
        }

        setVehicle(vehicleData);
        document.title = `${vehicleData?.name || "Fahrzeug"} | WohnmobilTraum`;
        setBookedDates(
          Array.isArray(payload?.bookedDates) ? payload.bookedDates : []
        );
      } catch (err) {
        console.error("Error fetching vehicle details:", err);
        setError("Das Fahrzeug konnte nicht geladen werden.");
      } finally {
        setLoading(false);
      }
    };

    fetchVehicleDetails();
  }, [slug]);

  const checkAvailability = async () => {
    if (!startDate || !endDate || !vehicle?._id) {
      return;
    }

    setAvailabilityStatus({
      checked: false,
      available: false,
      loading: true,
      message: null,
    });

    try {
      const response = await vehicleService.checkAvailability(
        vehicle._id,
        startDate,
        endDate
      );

      const payload = response?.data?.data ?? response?.data ?? {};
      const available = Boolean(
        payload?.available ?? response?.data?.available ?? false
      );

      setAvailabilityStatus({
        checked: true,
        available,
        loading: false,
        message: available
          ? "Fahrzeug ist in diesem Zeitraum verfügbar!"
          : "Leider ist das Fahrzeug in diesem Zeitraum nicht verfügbar.",
      });
    } catch (err) {
      console.error("Error checking availability:", err);
      setAvailabilityStatus({
        checked: true,
        available: false,
        loading: false,
        message: "Die Verfügbarkeit konnte nicht geprüft werden.",
      });
    }
  };

  const galleryImages = useMemo(() => {
    if (!vehicle?.images) return [];
    return vehicle.images.map((image) => image?.url).filter(Boolean);
  }, [vehicle]);

  const heroImage = useMemo(() => getVehicleImage(vehicle), [vehicle]);
  // const secondaryImages = useMemo(
  //   () => galleryImages.slice(1, 5),
  //   [galleryImages]
  // );

  const pricing = vehicle?.pricing || {};
  const basePricePerDay = formatCurrency(pricing?.basePrice?.perDay);
  const basePricePerWeek = formatCurrency(pricing?.basePrice?.perWeek);
  const basePricePerMonth = formatCurrency(pricing?.basePrice?.perMonth);
  const deposit = formatCurrency(pricing?.deposit);
  const cleaningFee = formatCurrency(pricing?.cleaningFee);
  const serviceFee = formatCurrency(pricing?.serviceFee);
  const extras = Array.isArray(pricing?.extras) ? pricing.extras : [];

  const quickStats = [
    {
      label: "Sitzplätze",
      value: vehicle?.capacity?.seats,
      icon: HiUserGroup,
    },
    {
      label: "Schlafplätze",
      value: vehicle?.capacity?.sleepingPlaces,
      icon: HiHome,
    },
    {
      label: "Baujahr",
      value: vehicle?.technicalData?.year,
      icon: HiCalendar,
    },
    {
      label: "Getriebe",
      value: vehicle?.technicalData?.transmission,
      icon: HiCheckCircle,
    },
    {
      label: "Kraftstoff",
      value: vehicle?.technicalData?.fuelType,
      icon: HiShieldCheck,
    },
    {
      label: "Länge",
      value: vehicle?.technicalData?.length
        ? `${vehicle.technicalData.length} m`
        : null,
      icon: HiArrowsExpand,
    },
    {
      label: "Führerschein",
      value: vehicle?.technicalData?.requiredLicense,
      icon: HiShieldCheck,
    },
  ].filter((stat) => Boolean(stat.value));

  const highlightChips = [
    vehicle?.category,
    vehicle?.technicalData?.fuelType,
    vehicle?.technicalData?.transmission,
    vehicle?.equipment?.climate?.airConditioning ? "Klimaanlage" : null,
    vehicle?.equipment?.outdoor?.awning ? "Markise" : null,
    vehicle?.equipment?.power?.solarPanel ? "Solarstrom" : null,
  ].filter(Boolean);

  const ratingValue = vehicle?.statistics?.rating?.average ?? 0;
  const ratingCount = vehicle?.statistics?.rating?.count ?? 0;
  const reviews = Array.isArray(vehicle?.reviews) ? vehicle.reviews : [];
  const upcomingBookings = bookedDates.length;

  const equipmentGroups = [
    {
      title: "Küche",
      items: [
        {
          label: "Voll ausgestattete Küche",
          available: vehicle?.equipment?.kitchen?.available,
        },
        {
          label: "Kühlschrank",
          available: vehicle?.equipment?.kitchen?.refrigerator,
        },
        {
          label: "Herd",
          available: vehicle?.equipment?.kitchen?.stove,
        },
        {
          label: "Backofen",
          available: vehicle?.equipment?.kitchen?.oven,
        },
        {
          label: "Mikrowelle",
          available: vehicle?.equipment?.kitchen?.microwave,
        },
      ],
    },
    {
      title: "Bad",
      items: [
        {
          label: "Badezimmer",
          available: vehicle?.equipment?.bathroom?.available,
        },
        {
          label: "Toilette",
          available: vehicle?.equipment?.bathroom?.toilet,
        },
        {
          label: "Dusche",
          available: vehicle?.equipment?.bathroom?.shower,
        },
        {
          label: "Warmwasser",
          available: vehicle?.equipment?.bathroom?.hotWater,
        },
      ],
    },
    {
      title: "Entertainment",
      items: [
        {
          label: "Fernseher",
          available: vehicle?.equipment?.entertainment?.tv,
        },
        {
          label: "Radio",
          available: vehicle?.equipment?.entertainment?.radio,
        },
        {
          label: "Bluetooth",
          available: vehicle?.equipment?.entertainment?.bluetooth,
        },
        {
          label: "WLAN",
          available: vehicle?.equipment?.entertainment?.wifi,
        },
      ],
    },
    {
      title: "Klima & Energie",
      items: [
        {
          label: "Heizung",
          available: vehicle?.equipment?.climate?.heating,
        },
        {
          label: "Klimaanlage",
          available: vehicle?.equipment?.climate?.airConditioning,
        },
        {
          label: "Solaranlage",
          available: vehicle?.equipment?.power?.solarPanel,
        },
      ],
    },
    {
      title: "Outdoor",
      items: [
        {
          label: "Markise",
          available: vehicle?.equipment?.outdoor?.awning,
        },
        {
          label: "Fahrradträger",
          available: vehicle?.equipment?.outdoor?.bikeRack,
        },
      ],
    },
  ]
    .map((group) => ({
      ...group,
      items: group.items.filter((item) => item.available),
    }))
    .filter((group) => group.items.length > 0);

  const minSelectableDate = useMemo(
    () => new Date().toISOString().split("T")[0],
    []
  );

  const bookingLink = useMemo(() => {
    if (
      !vehicle?._id ||
      !startDate ||
      !endDate ||
      !availabilityStatus.available
    ) {
      return null;
    }

    const searchParams = new URLSearchParams({
      vehicleId: vehicle._id,
      startDate,
      endDate,
    });

    return `/booking/${vehicle._id}?${searchParams.toString()}`;
  }, [availabilityStatus.available, endDate, startDate, vehicle]);

  const nextImage = () => {
    setCurrentImageIndex((prev) =>
      prev === galleryImages.length - 1 ? 0 : prev + 1
    );
  };

  const prevImage = () => {
    setCurrentImageIndex((prev) =>
      prev === 0 ? galleryImages.length - 1 : prev - 1
    );
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen bg-gray-50">
        <div className="text-center">
          <Spinner size="xl" />
          <p className="mt-4 text-gray-600">
            Fahrzeugdetails werden geladen...
          </p>
        </div>
      </div>
    );
  }

  if (error || !vehicle) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="max-w-md w-full">
          <Alert color="failure" className="text-center">
            <HiExclamationCircle className="h-5 w-5" />
            <span className="ml-2">
              {error || "Das Fahrzeug wurde nicht gefunden."}
            </span>
          </Alert>
          <div className="mt-6 text-center">
            <Button as={Link} to="/vehicles" color="blue">
              Zurück zur Übersicht
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-slate-50 min-h-screen">
      {/* Hero Section with Image Gallery */}
      <section className="relative">
        {/* Main Image */}
        <div className="relative h-[70vh] overflow-hidden">
          <img
            src={galleryImages[currentImageIndex] || heroImage}
            alt={vehicle?.name || "Wohnmobil"}
            className="absolute inset-0 h-full w-full object-cover"
            onError={(event) => {
              event.currentTarget.onerror = null;
              event.currentTarget.src = FALLBACK_IMAGES[0];
            }}
          />

          {/* Gradient Overlay */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />

          {/* Navigation Arrows */}
          {galleryImages.length > 1 && (
            <>
              <button
                onClick={prevImage}
                className="absolute left-4 top-1/2 transform -translate-y-1/2 bg-white/20 backdrop-blur-sm text-white p-3 rounded-full hover:bg-white/30 transition-all"
              >
                <HiChevronLeft className="h-6 w-6" />
              </button>
              <button
                onClick={nextImage}
                className="absolute right-4 top-1/2 transform -translate-y-1/2 bg-white/20 backdrop-blur-sm text-white p-3 rounded-full hover:bg-white/30 transition-all"
              >
                <HiChevronRight className="h-6 w-6" />
              </button>
            </>
          )}

          {/* Image Counter */}
          {galleryImages.length > 1 && (
            <div className="absolute bottom-6 left-1/2 transform -translate-x-1/2 bg-black/50 backdrop-blur-sm text-white px-4 py-2 rounded-full text-sm">
              {currentImageIndex + 1} / {galleryImages.length}
            </div>
          )}

          {/* Gallery Button */}
          <button
            onClick={() => setIsImageModalOpen(true)}
            className="absolute bottom-6 right-6 bg-white/20 backdrop-blur-sm text-white px-4 py-2 rounded-lg hover:bg-white/30 transition-all flex items-center gap-2"
          >
            <HiCamera className="h-5 w-5" />
            Alle Bilder ({galleryImages.length})
          </button>
        </div>

        {/* Floating Info Card */}
        <div className="absolute bottom-0 left-0 right-0 p-6">
          <div className="max-w-7xl mx-auto">
            <div className="bg-white/95 backdrop-blur-sm rounded-2xl shadow-2xl p-8">
              <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
                <div className="flex-1">
                  {/* Breadcrumbs */}
                  <nav className="flex items-center gap-2 text-sm text-gray-600 mb-4">
                    <Link
                      to="/"
                      className="hover:text-blue-600 transition-colors"
                    >
                      Startseite
                    </Link>
                    <span>/</span>
                    <Link
                      to="/vehicles"
                      className="hover:text-blue-600 transition-colors"
                    >
                      Fahrzeuge
                    </Link>
                    <span>/</span>
                    <span className="text-gray-800 font-medium">
                      {vehicle?.name}
                    </span>
                  </nav>

                  <div className="flex items-start gap-4">
                    <div className="flex-1">
                      <h1 className="text-4xl font-bold text-gray-900 mb-3">
                        {vehicle?.name}
                      </h1>

                      <div className="flex flex-wrap items-center gap-4 text-gray-600 mb-4">
                        <span className="flex items-center gap-2">
                          <HiLocationMarker className="h-5 w-5" />
                          {getLocationLabel(vehicle)}
                        </span>
                        {ratingValue > 0 && (
                          <span className="flex items-center gap-2">
                            <HiStar className="h-5 w-5 text-yellow-500" />
                            <span className="font-semibold">
                              {ratingValue.toFixed(1)}
                            </span>
                            <span className="text-sm">
                              ({ratingCount} Bewertungen)
                            </span>
                          </span>
                        )}
                        {vehicle?.category && (
                          <Badge color="blue" className="px-3 py-1">
                            {vehicle.category}
                          </Badge>
                        )}
                      </div>

                      {highlightChips.length > 0 && (
                        <div className="flex flex-wrap gap-2">
                          {highlightChips.map((highlight) => (
                            <Badge
                              key={highlight}
                              color="gray"
                              className="px-3 py-1 text-xs"
                            >
                              {highlight}
                            </Badge>
                          ))}
                        </div>
                      )}
                    </div>

                    <div className="flex gap-3">
                      <Button
                        size="sm"
                        color="light"
                        className="flex items-center gap-2"
                      >
                        <HiHeart className="h-5 w-5" />
                        Favorit
                      </Button>
                      <Button
                        size="sm"
                        color="light"
                        className="flex items-center gap-2"
                      >
                        <HiShare className="h-5 w-5" />
                        Teilen
                      </Button>
                    </div>
                  </div>
                </div>

                <div className="bg-gradient-to-br from-blue-600 to-indigo-700 text-white rounded-2xl p-6 lg:min-w-[280px]">
                  <div className="text-center">
                    <p className="text-blue-100 text-sm mb-2">Preis ab</p>
                    <div className="text-3xl font-bold mb-1">
                      {basePricePerDay || "Auf Anfrage"}
                    </div>
                    {basePricePerDay && (
                      <p className="text-blue-100 text-sm">pro Tag</p>
                    )}
                  </div>

                  {upcomingBookings > 0 && (
                    <div className="mt-4 pt-4 border-t border-blue-400/30">
                      <p className="text-blue-100 text-xs text-center">
                        🔥 {upcomingBookings} Buchungen in den nächsten 90 Tagen
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Main Content */}
      <section className="py-16">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
            {/* Left Column - Details */}
            <div className="lg:col-span-2 space-y-8">
              {/* Quick Stats */}
              {quickStats.length > 0 && (
                <Card className="border-0 shadow-xl rounded-2xl">
                  <h2 className="text-2xl font-bold text-gray-900 mb-6">
                    Fahrzeugdetails
                  </h2>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
                    {quickStats.map((stat) => (
                      <div
                        key={stat.label}
                        className="text-center p-4 bg-gray-50 rounded-xl"
                      >
                        <stat.icon className="h-8 w-8 text-blue-600 mx-auto mb-2" />
                        <p className="text-sm text-gray-600 mb-1">
                          {stat.label}
                        </p>
                        <p className="font-bold text-gray-900">{stat.value}</p>
                      </div>
                    ))}
                  </div>
                </Card>
              )}

              {/* Tabs for detailed information */}
              <Card className="border-0 shadow-xl rounded-2xl">
                <Tabs aria-label="Vehicle details" style="underline">
                  <Tabs.Item
                    active
                    title="Beschreibung"
                    icon={HiOutlineSparkles}
                  >
                    <div className="space-y-6">
                      <div>
                        <p className="text-gray-700 leading-relaxed text-lg">
                          {vehicle?.description?.long ||
                            vehicle?.description?.short ||
                            "Luxuriös ausgestattet und perfekt für unvergessliche Reiseerlebnisse. Dieses Fahrzeug kombiniert Komfort mit Funktionalität."}
                        </p>
                      </div>

                      {vehicle?.technicalData && (
                        <div>
                          <h4 className="text-lg font-semibold text-gray-900 mb-4">
                            Technische Daten
                          </h4>
                          <div className="grid grid-cols-2 md:grid-cols-3 gap-4 text-sm">
                            <div className="bg-gray-50 p-3 rounded-lg">
                              <span className="text-gray-600">Marke:</span>
                              <p className="font-semibold">
                                {vehicle.technicalData.brand}
                              </p>
                            </div>
                            <div className="bg-gray-50 p-3 rounded-lg">
                              <span className="text-gray-600">Modell:</span>
                              <p className="font-semibold">
                                {vehicle.technicalData.model}
                              </p>
                            </div>
                            <div className="bg-gray-50 p-3 rounded-lg">
                              <span className="text-gray-600">Kraftstoff:</span>
                              <p className="font-semibold">
                                {vehicle.technicalData.fuelType}
                              </p>
                            </div>
                            <div className="bg-gray-50 p-3 rounded-lg">
                              <span className="text-gray-600">Getriebe:</span>
                              <p className="font-semibold">
                                {vehicle.technicalData.transmission}
                              </p>
                            </div>
                            <div className="bg-gray-50 p-3 rounded-lg">
                              <span className="text-gray-600">Leistung:</span>
                              <p className="font-semibold">
                                {vehicle.technicalData.enginePower} PS
                              </p>
                            </div>
                            <div className="bg-gray-50 p-3 rounded-lg">
                              <span className="text-gray-600">Verbrauch:</span>
                              <p className="font-semibold">
                                {vehicle.technicalData.fuelConsumption} L/100km
                              </p>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  </Tabs.Item>

                  <Tabs.Item title="Ausstattung" icon={HiCheckCircle}>
                    {equipmentGroups.length > 0 ? (
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        {equipmentGroups.map((group) => (
                          <div key={group.title}>
                            <h4 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                              {group.title}
                              <Badge color="gray" size="sm">
                                {group.items.length}
                              </Badge>
                            </h4>
                            <div className="space-y-3">
                              {group.items.map((item) => (
                                <div
                                  key={item.label}
                                  className="flex items-center gap-3 p-3 bg-green-50 rounded-lg"
                                >
                                  <HiCheckCircle className="h-5 w-5 text-green-600 flex-shrink-0" />
                                  <span className="text-gray-800">
                                    {item.label}
                                  </span>
                                </div>
                              ))}
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-gray-600 text-center py-8">
                        Ausstattungsdetails werden bald verfügbar sein.
                      </p>
                    )}
                  </Tabs.Item>

                  <Tabs.Item title="Preise" icon={HiCurrencyEuro}>
                    <div className="space-y-6">
                      {/* Base Prices */}
                      <div>
                        <h4 className="text-lg font-semibold text-gray-900 mb-4">
                          Mietpreise
                        </h4>
                        <div className="space-y-3">
                          {basePricePerDay && (
                            <div className="flex justify-between items-center p-4 bg-blue-50 rounded-lg">
                              <span className="text-gray-700">
                                Preis pro Tag
                              </span>
                              <span className="text-xl font-bold text-blue-600">
                                {basePricePerDay}
                              </span>
                            </div>
                          )}
                          {basePricePerWeek && (
                            <div className="flex justify-between items-center p-4 bg-gray-50 rounded-lg">
                              <span className="text-gray-700">
                                Preis pro Woche
                              </span>
                              <span className="text-lg font-semibold text-gray-900">
                                {basePricePerWeek}
                              </span>
                            </div>
                          )}
                          {basePricePerMonth && (
                            <div className="flex justify-between items-center p-4 bg-gray-50 rounded-lg">
                              <span className="text-gray-700">
                                Preis pro Monat
                              </span>
                              <span className="text-lg font-semibold text-gray-900">
                                {basePricePerMonth}
                              </span>
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Additional Fees */}
                      <div>
                        <h4 className="text-lg font-semibold text-gray-900 mb-4">
                          Zusätzliche Gebühren
                        </h4>
                        <div className="space-y-3">
                          {deposit && (
                            <div className="flex justify-between items-center p-4 border border-dashed border-gray-300 rounded-lg">
                              <span className="text-gray-700">
                                Kaution (erstattbar)
                              </span>
                              <span className="font-semibold text-gray-900">
                                {deposit}
                              </span>
                            </div>
                          )}
                          {cleaningFee && (
                            <div className="flex justify-between items-center p-4 bg-gray-50 rounded-lg">
                              <span className="text-gray-700">
                                Reinigungsgebühr
                              </span>
                              <span className="font-semibold text-gray-900">
                                {cleaningFee}
                              </span>
                            </div>
                          )}
                          {serviceFee && (
                            <div className="flex justify-between items-center p-4 bg-gray-50 rounded-lg">
                              <span className="text-gray-700">
                                Servicegebühr
                              </span>
                              <span className="font-semibold text-gray-900">
                                {serviceFee}
                              </span>
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Extras */}
                      {extras.length > 0 && (
                        <div>
                          <h4 className="text-lg font-semibold text-gray-900 mb-4">
                            Optionale Extras
                          </h4>
                          <div className="space-y-3">
                            {extras.map((extra, index) => (
                              <div
                                key={index}
                                className="flex justify-between items-center p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                              >
                                <span className="text-gray-700">
                                  {extra.name}
                                </span>
                                <span className="font-semibold text-gray-900">
                                  {formatCurrency(extra.price)}
                                  {extra.perDay ? " / Tag" : ""}
                                </span>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  </Tabs.Item>

                  <Tabs.Item title="Bewertungen" icon={HiStar}>
                    <div className="space-y-6">
                      {ratingValue > 0 && (
                        <div className="bg-gradient-to-r from-yellow-50 to-orange-50 p-6 rounded-xl">
                          <div className="flex items-center gap-4">
                            <div className="text-center">
                              <div className="text-4xl font-bold text-gray-900">
                                {ratingValue.toFixed(1)}
                              </div>
                              <div className="flex justify-center mt-1">
                                {[...Array(5)].map((_, i) => (
                                  <HiStar
                                    key={i}
                                    className={`h-5 w-5 ${
                                      i < Math.floor(ratingValue)
                                        ? "text-yellow-400"
                                        : "text-gray-300"
                                    }`}
                                  />
                                ))}
                              </div>
                              <p className="text-sm text-gray-600 mt-1">
                                {ratingCount} Bewertungen
                              </p>
                            </div>
                            <div className="flex-1">
                              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                                Ausgezeichnete Bewertungen
                              </h3>
                              <p className="text-gray-600">
                                Gäste schätzen besonders die Sauberkeit,
                                Ausstattung und den Service.
                              </p>
                            </div>
                          </div>
                        </div>
                      )}

                      {reviews.length > 0 ? (
                        <div className="space-y-6">
                          {reviews.map((review, index) => {
                            const reviewer = review?.user || {};
                            const reviewerName =
                              [reviewer.firstName, reviewer.lastName]
                                .filter(Boolean)
                                .join(" ") || "Gast";

                            return (
                              <div
                                key={index}
                                className="bg-white border border-gray-200 rounded-xl p-6"
                              >
                                <div className="flex gap-4">
                                  <Avatar
                                    img={
                                      reviewer.profilePicture || reviewer.avatar
                                    }
                                    alt={reviewerName}
                                    rounded
                                    size="md"
                                  />
                                  <div className="flex-1">
                                    <div className="flex flex-wrap items-center gap-3 mb-2">
                                      <h4 className="font-semibold text-gray-900">
                                        {reviewerName}
                                      </h4>
                                      <span className="flex items-center gap-1 text-xs text-gray-500">
                                        <HiClock className="h-4 w-4" />
                                        {review?.createdAt
                                          ? new Date(
                                              review.createdAt
                                            ).toLocaleDateString("de-DE")
                                          : "Unbekannt"}
                                      </span>
                                    </div>
                                    <div className="mb-3">
                                      <Rating size="sm">
                                        {[...Array(5)].map((_, starIndex) => (
                                          <Rating.Star
                                            key={starIndex}
                                            filled={
                                              starIndex < (review?.rating || 0)
                                            }
                                          />
                                        ))}
                                      </Rating>
                                    </div>
                                    {review?.comment && (
                                      <p className="text-gray-700 leading-relaxed">
                                        {review.comment}
                                      </p>
                                    )}
                                  </div>
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      ) : (
                        <div className="text-center py-12">
                          <HiStar className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                          <h3 className="text-lg font-semibold text-gray-900 mb-2">
                            Noch keine Bewertungen
                          </h3>
                          <p className="text-gray-600">
                            Seien Sie die erste Person, die dieses Fahrzeug
                            bewertet!
                          </p>
                        </div>
                      )}
                    </div>
                  </Tabs.Item>
                </Tabs>
              </Card>
            </div>

            {/* Right Column - Booking Card */}
            <div className="space-y-6">
              {/* Booking Card */}
              <Card className="border-0 shadow-2xl rounded-2xl sticky top-24">
                <div className="space-y-6">
                  <div>
                    <h3 className="text-xl font-bold text-gray-900 mb-2">
                      Verfügbarkeit prüfen
                    </h3>
                    <p className="text-gray-600 text-sm">
                      Wählen Sie Ihre Reisedaten für eine Buchungsanfrage
                    </p>
                  </div>

                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        Abholdatum
                      </label>
                      <input
                        type="date"
                        value={startDate}
                        onChange={(e) => setStartDate(e.target.value)}
                        min={minSelectableDate}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        Rückgabedatum
                      </label>
                      <input
                        type="date"
                        value={endDate}
                        onChange={(e) => setEndDate(e.target.value)}
                        min={startDate || minSelectableDate}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      />
                    </div>
                  </div>

                  <Button
                    onClick={checkAvailability}
                    disabled={
                      !startDate || !endDate || availabilityStatus.loading
                    }
                    className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-semibold py-3 rounded-lg transition-all duration-300"
                    isProcessing={availabilityStatus.loading}
                  >
                    {availabilityStatus.loading
                      ? "Prüfung läuft..."
                      : "Verfügbarkeit prüfen"}
                  </Button>

                  {availabilityStatus.checked && (
                    <Alert
                      color={
                        availabilityStatus.available ? "success" : "failure"
                      }
                      className="rounded-lg"
                    >
                      <span className="font-medium">
                        {availabilityStatus.message}
                      </span>
                    </Alert>
                  )}

                  {bookingLink && (
                    <Button
                      as={Link}
                      to={bookingLink}
                      className="w-full bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white font-bold py-4 rounded-lg transition-all duration-300 text-lg"
                    >
                      🎉 Jetzt buchen
                    </Button>
                  )}

                  <div className="space-y-3 pt-4 border-t border-gray-200">
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Mindestmietdauer:</span>
                      <span className="font-medium">
                        {vehicle?.restrictions?.minRentalDays || 3} Tage
                      </span>
                    </div>
                    {deposit && (
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-600">Kaution:</span>
                        <span className="font-medium">{deposit}</span>
                      </div>
                    )}
                    <div className="bg-green-50 p-3 rounded-lg">
                      <p className="text-green-800 text-sm font-medium text-center">
                        ✅ Kostenlose Stornierung bis 48h vor Abholung
                      </p>
                    </div>
                  </div>
                </div>
              </Card>

              {/* Owner/Agent Contact */}
              {vehicle?.owner && (
                <Card className="border-0 shadow-lg rounded-2xl">
                  <div className="space-y-4">
                    <h4 className="text-lg font-bold text-gray-900">
                      Ihr Ansprechpartner
                    </h4>
                    <div className="flex items-center gap-4">
                      <Avatar
                        img={
                          vehicle.owner?.profile?.avatar ||
                          vehicle.owner?.avatar
                        }
                        alt={vehicle.owner?.firstName || "Ansprechpartner"}
                        size="lg"
                        rounded
                      />
                      <div className="flex-1">
                        <h5 className="font-semibold text-gray-900">
                          {[vehicle.owner?.firstName, vehicle.owner?.lastName]
                            .filter(Boolean)
                            .join(" ") || "WohnmobilTraum Team"}
                        </h5>
                        {vehicle.owner?.agentProfile?.companyName && (
                          <p className="text-sm text-gray-600">
                            {vehicle.owner.agentProfile.companyName}
                          </p>
                        )}
                        {vehicle.owner?.agentProfile?.rating && (
                          <div className="flex items-center gap-1 mt-1">
                            <HiStar className="h-4 w-4 text-yellow-500" />
                            <span className="text-sm font-medium">
                              {vehicle.owner.agentProfile.rating.toFixed(1)}
                            </span>
                          </div>
                        )}
                      </div>
                    </div>
                    <p className="text-gray-600 text-sm">
                      Persönliche Beratung und Support für Ihre Traumreise. Wir
                      begleiten Sie von der Buchung bis zur Rückgabe.
                    </p>
                    <div className="flex gap-2">
                      <Button size="sm" color="blue" className="flex-1">
                        <HiPhone className="h-4 w-4 mr-2" />
                        Anrufen
                      </Button>
                      <Button size="sm" color="light" className="flex-1">
                        <HiMail className="h-4 w-4 mr-2" />
                        Nachricht
                      </Button>
                    </div>
                  </div>
                </Card>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Image Modal */}
      {isImageModalOpen && (
        <div className="fixed inset-0 bg-black/90 z-50 flex items-center justify-center p-4">
          <div className="max-w-6xl w-full max-h-full">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-white text-xl font-semibold">
                Fahrzeugbilder ({galleryImages.length})
              </h3>
              <button
                onClick={() => setIsImageModalOpen(false)}
                className="text-white hover:text-gray-300 p-2"
              >
                <HiExclamationCircle className="h-6 w-6" />
              </button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 max-h-96 overflow-y-auto">
              {galleryImages.map((image, index) => (
                <img
                  key={index}
                  src={image}
                  alt={`${vehicle?.name} - Bild ${index + 1}`}
                  className="w-full h-48 object-cover rounded-lg cursor-pointer hover:opacity-80 transition-opacity"
                  onClick={() => {
                    setCurrentImageIndex(index);
                    setIsImageModalOpen(false);
                  }}
                />
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default VehicleDetailPage;
