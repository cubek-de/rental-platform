import { useState, useEffect, useCallback } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import {
  Button,
  Card,
  Carousel,
  Tabs,
  Badge,
  Spinner,
  Alert,
} from "flowbite-react";
import {
  HiCalendar,
  HiCurrencyEuro,
  HiUserGroup,
  HiOfficeBuilding,
  HiShieldCheck,
  HiCheckCircle,
  HiWifi,
  HiLocationMarker,
  HiExclamationCircle,
  HiStar,
  HiClock,
  HiTruck,
  HiLightningBolt,
  HiFire,
  HiHome,
  HiBeaker,
  HiGlobe,
  HiPhone,
  HiMail,
  HiArrowRight,
  HiInformationCircle,
  HiBan,
  HiCheck,
  HiX,
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
  const navigate = useNavigate();
  const [vehicle, setVehicle] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [availabilityChecked, setAvailabilityChecked] = useState(false);
  const [isAvailable, setIsAvailable] = useState(false);
  const [totalPrice, setTotalPrice] = useState(0);
  const [rentalDays, setRentalDays] = useState(0);
  const [availabilityError, setAvailabilityError] = useState("");
  const [checkingAvailability, setCheckingAvailability] = useState(false);

  useEffect(() => {
    const fetchVehicleDetails = async () => {
      setLoading(true);
      setError(null);
      try {
        const response = await vehicleService.getVehicleBySlug(slug);

        if (response?.data?.success) {
          // The API returns { success: true, data: { vehicle, bookedDates } }
          const vehicleData = response.data.data?.vehicle || response.data.data;

          if (vehicleData && vehicleData.name) {
            setVehicle(vehicleData);
            document.title = `${vehicleData.name} | FAIRmietung`;
          } else {
            setError("Fahrzeugdaten sind unvollständig.");
          }
        } else {
          setError(response?.data?.message || "Fahrzeug nicht gefunden.");
        }
      } catch (err) {
        console.error("Error fetching vehicle details:", err);
        setError(
          err.response?.data?.message ||
          "Das Fahrzeug konnte nicht geladen werden."
        );
      } finally {
        setLoading(false);
      }
    };

    if (slug) {
      fetchVehicleDetails();
    }
  }, [slug]);

  const calculatePrice = useCallback(() => {
    if (!startDate || !endDate || !vehicle) return;

    const start = new Date(startDate);
    const end = new Date(endDate);
    const days = Math.ceil((end - start) / (1000 * 60 * 60 * 24));
    setRentalDays(days);

    const basePrice = (vehicle?.pricing?.basePrice?.perDay || 0) * days;
    const cleaningFee = vehicle?.pricing?.cleaningFee || 0;
    const total = basePrice + cleaningFee;
    setTotalPrice(total);
  }, [startDate, endDate, vehicle]);

  const checkAvailability = useCallback(async () => {
    if (!startDate || !endDate) {
      setAvailabilityError("Bitte wählen Sie Start- und Enddatum aus.");
      return;
    }

    // Check if end date is after start date
    if (new Date(endDate) <= new Date(startDate)) {
      setAvailabilityError("Rückgabedatum muss nach dem Abholdatum liegen.");
      return;
    }

    try {
      setCheckingAvailability(true);
      setAvailabilityError("");

      const response = await vehicleService.checkAvailability(
        vehicle._id,
        startDate,
        endDate
      );

      if (response?.data?.success) {
        const available = response.data.data.available;
        setIsAvailable(available);
        setAvailabilityChecked(true);

        if (available) {
          calculatePrice();
        } else {
          setAvailabilityError(
            "Das Fahrzeug ist für diese Daten bereits gebucht. Bitte wählen Sie andere Daten."
          );
        }
      } else {
        setAvailabilityError("Fehler beim Prüfen der Verfügbarkeit.");
      }
    } catch (err) {
      console.error("Availability check error:", err);
      setAvailabilityError(
        "Fehler beim Prüfen der Verfügbarkeit. Bitte versuchen Sie es erneut."
      );
    } finally {
      setCheckingAvailability(false);
    }
  }, [startDate, endDate, vehicle, calculatePrice]);

  // Auto-check availability when both dates are selected
  useEffect(() => {
    if (startDate && endDate && vehicle) {
      // Reset previous check
      setAvailabilityChecked(false);
      setIsAvailable(false);

      // Auto-check availability
      checkAvailability();
    }
  }, [startDate, endDate, vehicle, checkAvailability]);

  const handleBooking = () => {
    if (!startDate || !endDate) {
      setAvailabilityError("Bitte wählen Sie Start- und Enddatum aus.");
      return;
    }

    if (!isAvailable || availabilityError) {
      setAvailabilityError(
        "Das Fahrzeug ist für diese Daten nicht verfügbar. Bitte wählen Sie andere Daten."
      );
      return;
    }

    // Pass slug instead of _id so the API can find the vehicle
    navigate(
      `/booking/new?vehicleSlug=${vehicle.slug}&startDate=${startDate}&endDate=${endDate}`
    );
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen bg-gray-50">
        <div className="text-center">
          <Spinner size="xl" color="info" />
          <p className="mt-4 text-gray-600">Fahrzeug wird geladen...</p>
        </div>
      </div>
    );
  }

  if (error || !vehicle) {
    return (
      <div className="container mx-auto px-4 py-12">
        <Alert color="failure" icon={HiExclamationCircle}>
          <div>
            <h3 className="text-lg font-semibold mb-2">
              Fahrzeug nicht gefunden
            </h3>
            <p className="mb-4">
              {error || "Das angeforderte Fahrzeug wurde nicht gefunden."}
            </p>
            <Button as={Link} to="/vehicles" color="failure" size="sm">
              Zurück zur Übersicht
            </Button>
          </div>
        </Alert>
      </div>
    );
  }

  // Safely get vehicle data with fallbacks
  let imageUrl, locationLabel, rating, reviewCount;
  try {
    imageUrl = getVehicleImage(vehicle);
    locationLabel = getLocationLabel(vehicle);
    rating = vehicle?.statistics?.rating?.average || 0;
    reviewCount = vehicle?.statistics?.rating?.count || 0;
  } catch (err) {
    console.error("Error processing vehicle data:", err);
    imageUrl = FALLBACK_IMAGES[0];
    locationLabel = "Deutschland";
    rating = 0;
    reviewCount = 0;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Breadcrumbs */}
      <div className="bg-white border-b">
        <div className="container mx-auto px-4 py-4">
          <nav className="flex" aria-label="Breadcrumb">
            <ol className="inline-flex items-center space-x-1 md:space-x-3">
              <li>
                <Link
                  to="/"
                  className="text-gray-600 hover:text-primary-600 transition-colors"
                >
                  Startseite
                </Link>
              </li>
              <li>
                <div className="flex items-center">
                  <HiArrowRight className="mx-2 text-gray-400" />
                  <Link
                    to="/vehicles"
                    className="text-gray-600 hover:text-primary-600 transition-colors"
                  >
                    Fahrzeuge
                  </Link>
                </div>
              </li>
              <li>
                <div className="flex items-center">
                  <HiArrowRight className="mx-2 text-gray-400" />
                  <span className="text-gray-500">{vehicle.category}</span>
                </div>
              </li>
            </ol>
          </nav>
        </div>
      </div>

      {/* Hero Section with Images */}
      <section className="bg-white">
        <div className="container mx-auto px-4 py-8">
          {/* Header */}
          <div className="mb-6">
            <div className="flex flex-col md:flex-row justify-between items-start mb-4">
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-3">
                  <Badge color="info" size="lg">
                    {vehicle.category}
                  </Badge>
                  {vehicle.featured && (
                    <Badge color="warning" icon={HiStar}>
                      Premium
                    </Badge>
                  )}
                  {vehicle.status === "aktiv" && (
                    <Badge color="success" icon={HiCheckCircle}>
                      Verfügbar
                    </Badge>
                  )}
                </div>
                <h1 className="text-3xl md:text-4xl font-black text-gray-900 mb-3">
                  {vehicle.name}
                </h1>
                <div className="flex flex-wrap items-center gap-4 text-gray-600">
                  <div className="flex items-center">
                    <HiLocationMarker className="mr-2 text-primary-500" />
                    <span className="font-medium">{locationLabel}</span>
                  </div>
                  {rating > 0 && (
                    <div className="flex items-center gap-2">
                      <div className="flex items-center">
                        {[...Array(5)].map((_, i) => (
                          <HiStar
                            key={i}
                            className={`h-5 w-5 ${
                              i < Math.floor(rating)
                                ? "text-yellow-400"
                                : "text-gray-300"
                            }`}
                          />
                        ))}
                      </div>
                      <span className="font-semibold text-gray-900">
                        {rating.toFixed(1)}
                      </span>
                      <span className="text-gray-500">
                        ({reviewCount} Bewertungen)
                      </span>
                    </div>
                  )}
                  <div className="flex items-center">
                    <HiClock className="mr-2 text-primary-500" />
                    <span>{vehicle.statistics?.views || 0} Aufrufe</span>
                  </div>
                </div>
              </div>

              <div className="mt-4 md:mt-0 text-right">
                <div className="bg-primary-50 px-6 py-4 rounded-2xl border-2 border-primary-200">
                  <p className="text-sm text-gray-600 mb-1">Preis ab</p>
                  <div className="text-4xl font-black text-primary-600">
                    {formatCurrency(vehicle?.pricing?.basePrice?.perDay || 0)}
                  </div>
                  <p className="text-sm text-gray-600 mt-1">pro Tag</p>
                </div>
              </div>
            </div>
          </div>

          {/* Image Gallery */}
          <div className="mb-8">
            {vehicle.images && vehicle.images.length > 0 ? (
              <div className="h-96 md:h-[500px] rounded-2xl overflow-hidden shadow-2xl">
                <Carousel slide={false} indicators={true}>
                  {vehicle.images.map((image, index) => (
                    <div key={index} className="relative h-full">
                      <img
                        src={image.url}
                        alt={image.caption || `${vehicle.name} - Bild ${index + 1}`}
                        className="h-full w-full object-cover"
                        onError={(e) => {
                          e.target.onerror = null;
                          e.target.src = FALLBACK_IMAGES[0];
                        }}
                      />
                      {image.caption && (
                        <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/60 to-transparent p-6">
                          <p className="text-white font-semibold text-lg">
                            {image.caption}
                          </p>
                        </div>
                      )}
                    </div>
                  ))}
                </Carousel>
              </div>
            ) : (
              <div className="h-96 md:h-[500px] rounded-2xl overflow-hidden shadow-2xl">
                <img
                  src={imageUrl}
                  alt={vehicle.name}
                  className="h-full w-full object-cover"
                  onError={(e) => {
                    e.target.onerror = null;
                    e.target.src = FALLBACK_IMAGES[0];
                  }}
                />
              </div>
            )}
          </div>

          {/* Quick Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
            <div className="bg-gradient-to-br from-blue-50 to-blue-100 p-6 rounded-xl border border-blue-200">
              <HiUserGroup className="h-8 w-8 text-blue-600 mb-2" />
              <p className="text-2xl font-bold text-gray-900">
                {vehicle?.capacity?.seats || 0}
              </p>
              <p className="text-sm text-gray-600">Sitzplätze</p>
            </div>
            <div className="bg-gradient-to-br from-green-50 to-green-100 p-6 rounded-xl border border-green-200">
              <HiHome className="h-8 w-8 text-green-600 mb-2" />
              <p className="text-2xl font-bold text-gray-900">
                {vehicle?.capacity?.sleepingPlaces || 0}
              </p>
              <p className="text-sm text-gray-600">Schlafplätze</p>
            </div>
            <div className="bg-gradient-to-br from-purple-50 to-purple-100 p-6 rounded-xl border border-purple-200">
              <HiCalendar className="h-8 w-8 text-purple-600 mb-2" />
              <p className="text-2xl font-bold text-gray-900">
                {vehicle?.technicalData?.year || '-'}
              </p>
              <p className="text-sm text-gray-600">Baujahr</p>
            </div>
            <div className="bg-gradient-to-br from-orange-50 to-orange-100 p-6 rounded-xl border border-orange-200">
              <HiTruck className="h-8 w-8 text-orange-600 mb-2" />
              <p className="text-2xl font-bold text-gray-900">
                {vehicle?.technicalData?.length || '-'}m
              </p>
              <p className="text-sm text-gray-600">Länge</p>
            </div>
          </div>
        </div>
      </section>

      {/* Main Content */}
      <section className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column - Details */}
          <div className="lg:col-span-2">
            <Tabs aria-label="Vehicle details tabs">
              {/* Description Tab */}
              <Tabs.Item active title="Übersicht" icon={HiInformationCircle}>
                <div className="space-y-6">
                  {/* Description */}
                  <Card>
                    <h3 className="text-2xl font-bold mb-4 flex items-center">
                      <HiInformationCircle className="mr-2 text-primary-500" />
                      Beschreibung
                    </h3>
                    <p className="text-gray-700 leading-relaxed whitespace-pre-line">
                      {vehicle.description?.long ||
                        vehicle.description?.short ||
                        "Keine Beschreibung verfügbar."}
                    </p>

                    {vehicle.description?.highlights &&
                      vehicle.description.highlights.length > 0 && (
                        <div className="mt-6">
                          <h4 className="font-bold text-lg mb-3">Highlights</h4>
                          <div className="grid grid-cols-2 gap-3">
                            {vehicle.description.highlights.map((highlight, idx) => (
                              <div
                                key={idx}
                                className="flex items-center bg-primary-50 px-4 py-2 rounded-lg"
                              >
                                <HiCheckCircle className="text-primary-600 mr-2 flex-shrink-0" />
                                <span className="text-gray-800">{highlight}</span>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                  </Card>

                  {/* Technical Data */}
                  <Card>
                    <h3 className="text-2xl font-bold mb-4 flex items-center">
                      <HiTruck className="mr-2 text-primary-500" />
                      Technische Daten
                    </h3>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="border-b pb-3">
                        <p className="text-sm text-gray-500">Marke</p>
                        <p className="font-semibold text-gray-900">
                          {vehicle?.technicalData?.brand || '-'}
                        </p>
                      </div>
                      <div className="border-b pb-3">
                        <p className="text-sm text-gray-500">Modell</p>
                        <p className="font-semibold text-gray-900">
                          {vehicle?.technicalData?.model || '-'}
                        </p>
                      </div>
                      <div className="border-b pb-3">
                        <p className="text-sm text-gray-500">Kraftstoff</p>
                        <p className="font-semibold text-gray-900">
                          {vehicle?.technicalData?.fuelType || '-'}
                        </p>
                      </div>
                      <div className="border-b pb-3">
                        <p className="text-sm text-gray-500">Getriebe</p>
                        <p className="font-semibold text-gray-900">
                          {vehicle?.technicalData?.transmission || '-'}
                        </p>
                      </div>
                      <div className="border-b pb-3">
                        <p className="text-sm text-gray-500">Motorleistung</p>
                        <p className="font-semibold text-gray-900">
                          {vehicle?.technicalData?.enginePower || '-'} PS
                        </p>
                      </div>
                      <div className="border-b pb-3">
                        <p className="text-sm text-gray-500">Verbrauch</p>
                        <p className="font-semibold text-gray-900">
                          {vehicle?.technicalData?.fuelConsumption || '-'} L/100km
                        </p>
                      </div>
                      <div className="border-b pb-3">
                        <p className="text-sm text-gray-500">Breite</p>
                        <p className="font-semibold text-gray-900">
                          {vehicle?.technicalData?.width || '-'}m
                        </p>
                      </div>
                      <div className="border-b pb-3">
                        <p className="text-sm text-gray-500">Höhe</p>
                        <p className="font-semibold text-gray-900">
                          {vehicle?.technicalData?.height || '-'}m
                        </p>
                      </div>
                      <div className="border-b pb-3">
                        <p className="text-sm text-gray-500">Gewicht</p>
                        <p className="font-semibold text-gray-900">
                          {vehicle?.technicalData?.weight || '-'} kg
                        </p>
                      </div>
                      <div className="border-b pb-3">
                        <p className="text-sm text-gray-500">Erforderlicher Führerschein</p>
                        <p className="font-semibold text-gray-900">
                          Klasse {vehicle?.technicalData?.requiredLicense || '-'}
                        </p>
                      </div>
                      <div className="border-b pb-3">
                        <p className="text-sm text-gray-500">Tankkapazität</p>
                        <p className="font-semibold text-gray-900">
                          {vehicle?.technicalData?.tankCapacity || '-'} Liter
                        </p>
                      </div>
                    </div>
                  </Card>
                </div>
              </Tabs.Item>

              {/* Equipment Tab */}
              <Tabs.Item title="Ausstattung" icon={HiCheckCircle}>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Kitchen */}
                  {vehicle.equipment?.kitchen?.available && (
                    <Card>
                      <h4 className="font-bold text-lg mb-4 flex items-center">
                        <HiBeaker className="mr-2 text-primary-500" />
                        Küche
                      </h4>
                      <ul className="space-y-2">
                        {vehicle.equipment.kitchen.refrigerator && (
                          <li className="flex items-center text-gray-700">
                            <HiCheck className="text-green-500 mr-2" />
                            Kühlschrank
                          </li>
                        )}
                        {vehicle.equipment.kitchen.freezer && (
                          <li className="flex items-center text-gray-700">
                            <HiCheck className="text-green-500 mr-2" />
                            Gefrierfach
                          </li>
                        )}
                        {vehicle.equipment.kitchen.stove && (
                          <li className="flex items-center text-gray-700">
                            <HiCheck className="text-green-500 mr-2" />
                            Herd
                          </li>
                        )}
                        {vehicle.equipment.kitchen.oven && (
                          <li className="flex items-center text-gray-700">
                            <HiCheck className="text-green-500 mr-2" />
                            Backofen
                          </li>
                        )}
                        {vehicle.equipment.kitchen.microwave && (
                          <li className="flex items-center text-gray-700">
                            <HiCheck className="text-green-500 mr-2" />
                            Mikrowelle
                          </li>
                        )}
                        {vehicle.equipment.kitchen.coffeeMachine && (
                          <li className="flex items-center text-gray-700">
                            <HiCheck className="text-green-500 mr-2" />
                            Kaffeemaschine
                          </li>
                        )}
                        {vehicle.equipment.kitchen.dishwasher && (
                          <li className="flex items-center text-gray-700">
                            <HiCheck className="text-green-500 mr-2" />
                            Geschirrspüler
                          </li>
                        )}
                      </ul>
                    </Card>
                  )}

                  {/* Bathroom */}
                  {vehicle.equipment?.bathroom?.available && (
                    <Card>
                      <h4 className="font-bold text-lg mb-4 flex items-center">
                        <HiHome className="mr-2 text-primary-500" />
                        Badezimmer
                      </h4>
                      <ul className="space-y-2">
                        {vehicle.equipment.bathroom.toilet && (
                          <li className="flex items-center text-gray-700">
                            <HiCheck className="text-green-500 mr-2" />
                            Toilette
                          </li>
                        )}
                        {vehicle.equipment.bathroom.shower && (
                          <li className="flex items-center text-gray-700">
                            <HiCheck className="text-green-500 mr-2" />
                            Dusche
                          </li>
                        )}
                        {vehicle.equipment.bathroom.sink && (
                          <li className="flex items-center text-gray-700">
                            <HiCheck className="text-green-500 mr-2" />
                            Waschbecken
                          </li>
                        )}
                        {vehicle.equipment.bathroom.hotWater && (
                          <li className="flex items-center text-gray-700">
                            <HiCheck className="text-green-500 mr-2" />
                            Warmwasser
                          </li>
                        )}
                      </ul>
                    </Card>
                  )}

                  {/* Climate */}
                  <Card>
                    <h4 className="font-bold text-lg mb-4 flex items-center">
                      <HiFire className="mr-2 text-primary-500" />
                      Klima
                    </h4>
                    <ul className="space-y-2">
                      {vehicle.equipment?.climate?.heating && (
                        <li className="flex items-center text-gray-700">
                          <HiCheck className="text-green-500 mr-2" />
                          Heizung
                        </li>
                      )}
                      {vehicle.equipment?.climate?.airConditioning && (
                        <li className="flex items-center text-gray-700">
                          <HiCheck className="text-green-500 mr-2" />
                          Klimaanlage
                        </li>
                      )}
                      {vehicle.equipment?.climate?.ventilation && (
                        <li className="flex items-center text-gray-700">
                          <HiCheck className="text-green-500 mr-2" />
                          Belüftung
                        </li>
                      )}
                    </ul>
                  </Card>

                  {/* Entertainment */}
                  <Card>
                    <h4 className="font-bold text-lg mb-4 flex items-center">
                      <HiWifi className="mr-2 text-primary-500" />
                      Unterhaltung
                    </h4>
                    <ul className="space-y-2">
                      {vehicle.equipment?.entertainment?.tv && (
                        <li className="flex items-center text-gray-700">
                          <HiCheck className="text-green-500 mr-2" />
                          Fernseher
                        </li>
                      )}
                      {vehicle.equipment?.entertainment?.radio && (
                        <li className="flex items-center text-gray-700">
                          <HiCheck className="text-green-500 mr-2" />
                          Radio
                        </li>
                      )}
                      {vehicle.equipment?.entertainment?.bluetooth && (
                        <li className="flex items-center text-gray-700">
                          <HiCheck className="text-green-500 mr-2" />
                          Bluetooth
                        </li>
                      )}
                      {vehicle.equipment?.entertainment?.wifi && (
                        <li className="flex items-center text-gray-700">
                          <HiCheck className="text-green-500 mr-2" />
                          WLAN
                        </li>
                      )}
                      {vehicle.equipment?.entertainment?.satellite && (
                        <li className="flex items-center text-gray-700">
                          <HiCheck className="text-green-500 mr-2" />
                          Satellit
                        </li>
                      )}
                    </ul>
                  </Card>

                  {/* Safety */}
                  <Card>
                    <h4 className="font-bold text-lg mb-4 flex items-center">
                      <HiShieldCheck className="mr-2 text-primary-500" />
                      Sicherheit
                    </h4>
                    <ul className="space-y-2">
                      {vehicle.equipment?.safety?.airbags && (
                        <li className="flex items-center text-gray-700">
                          <HiCheck className="text-green-500 mr-2" />
                          Airbags
                        </li>
                      )}
                      {vehicle.equipment?.safety?.abs && (
                        <li className="flex items-center text-gray-700">
                          <HiCheck className="text-green-500 mr-2" />
                          ABS
                        </li>
                      )}
                      {vehicle.equipment?.safety?.esp && (
                        <li className="flex items-center text-gray-700">
                          <HiCheck className="text-green-500 mr-2" />
                          ESP
                        </li>
                      )}
                      {vehicle.equipment?.safety?.rearCamera && (
                        <li className="flex items-center text-gray-700">
                          <HiCheck className="text-green-500 mr-2" />
                          Rückfahrkamera
                        </li>
                      )}
                      {vehicle.equipment?.safety?.parkingSensors && (
                        <li className="flex items-center text-gray-700">
                          <HiCheck className="text-green-500 mr-2" />
                          Parksensoren
                        </li>
                      )}
                      {vehicle.equipment?.safety?.alarm && (
                        <li className="flex items-center text-gray-700">
                          <HiCheck className="text-green-500 mr-2" />
                          Alarmanlage
                        </li>
                      )}
                    </ul>
                  </Card>

                  {/* Outdoor */}
                  <Card>
                    <h4 className="font-bold text-lg mb-4 flex items-center">
                      <HiGlobe className="mr-2 text-primary-500" />
                      Outdoor
                    </h4>
                    <ul className="space-y-2">
                      {vehicle.equipment?.outdoor?.awning && (
                        <li className="flex items-center text-gray-700">
                          <HiCheck className="text-green-500 mr-2" />
                          Markise
                        </li>
                      )}
                      {vehicle.equipment?.outdoor?.bikeRack && (
                        <li className="flex items-center text-gray-700">
                          <HiCheck className="text-green-500 mr-2" />
                          Fahrradträger
                        </li>
                      )}
                      {vehicle.equipment?.outdoor?.roofRack && (
                        <li className="flex items-center text-gray-700">
                          <HiCheck className="text-green-500 mr-2" />
                          Dachträger
                        </li>
                      )}
                      {vehicle.equipment?.outdoor?.towbar && (
                        <li className="flex items-center text-gray-700">
                          <HiCheck className="text-green-500 mr-2" />
                          Anhängerkupplung
                        </li>
                      )}
                      {vehicle.equipment?.outdoor?.outdoorFurniture && (
                        <li className="flex items-center text-gray-700">
                          <HiCheck className="text-green-500 mr-2" />
                          Gartenmöbel
                        </li>
                      )}
                      {vehicle.equipment?.outdoor?.grill && (
                        <li className="flex items-center text-gray-700">
                          <HiCheck className="text-green-500 mr-2" />
                          Grill
                        </li>
                      )}
                    </ul>
                  </Card>
                </div>
              </Tabs.Item>

              {/* Pricing Tab */}
              <Tabs.Item title="Preise" icon={HiCurrencyEuro}>
                <Card>
                  <h3 className="text-2xl font-bold mb-6">Preisübersicht</h3>

                  <div className="space-y-4">
                    <div className="flex justify-between items-center py-3 border-b-2">
                      <span className="text-lg">Tagespreis</span>
                      <span className="text-2xl font-bold text-primary-600">
                        {formatCurrency(vehicle.pricing.basePrice.perDay)}
                      </span>
                    </div>

                    {vehicle.pricing.basePrice.perWeek && (
                      <div className="flex justify-between items-center py-3 border-b">
                        <span className="text-lg">Wochenpreis</span>
                        <span className="text-xl font-semibold text-gray-900">
                          {formatCurrency(vehicle.pricing.basePrice.perWeek)}
                        </span>
                      </div>
                    )}

                    {vehicle.pricing.basePrice.perMonth && (
                      <div className="flex justify-between items-center py-3 border-b">
                        <span className="text-lg">Monatspreis</span>
                        <span className="text-xl font-semibold text-gray-900">
                          {formatCurrency(vehicle.pricing.basePrice.perMonth)}
                        </span>
                      </div>
                    )}

                    <div className="mt-6">
                      <h4 className="font-bold text-lg mb-3">
                        Zusätzliche Gebühren
                      </h4>
                      <div className="space-y-3">
                        <div className="flex justify-between items-center">
                          <span>Kaution (rückzahlbar)</span>
                          <span className="font-semibold">
                            {formatCurrency(vehicle.pricing.deposit)}
                          </span>
                        </div>
                        {vehicle.pricing.cleaningFee > 0 && (
                          <div className="flex justify-between items-center">
                            <span>Endreinigung</span>
                            <span className="font-semibold">
                              {formatCurrency(vehicle.pricing.cleaningFee)}
                            </span>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Mileage */}
                    {vehicle.pricing.mileage && (
                      <div className="mt-6 bg-blue-50 p-4 rounded-lg">
                        <h4 className="font-bold mb-2">Kilometerpaket</h4>
                        <p className="text-gray-700">
                          {vehicle.pricing.mileage.included} km pro Tag inklusive
                        </p>
                        <p className="text-sm text-gray-600">
                          Zusätzliche Kilometer:{" "}
                          {formatCurrency(vehicle.pricing.mileage.extraCost)} pro km
                        </p>
                      </div>
                    )}

                    {/* Insurance */}
                    {vehicle.pricing.insurance && (
                      <div className="mt-6">
                        <h4 className="font-bold text-lg mb-3">Versicherung</h4>
                        <div className="space-y-2">
                          <div className="flex justify-between items-center">
                            <span>Basisversicherung</span>
                            <span className="font-semibold">
                              {formatCurrency(vehicle.pricing.insurance.basic)}/Tag
                            </span>
                          </div>
                          <div className="flex justify-between items-center">
                            <span>Vollkaskoversicherung</span>
                            <span className="font-semibold">
                              {formatCurrency(
                                vehicle.pricing.insurance.comprehensive
                              )}
                              /Tag
                            </span>
                          </div>
                          <div className="flex justify-between items-center text-sm text-gray-600">
                            <span>Selbstbeteiligung</span>
                            <span>
                              {formatCurrency(vehicle.pricing.insurance.deductible)}
                            </span>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Extras */}
                    {vehicle.pricing.extras &&
                      vehicle.pricing.extras.length > 0 && (
                        <div className="mt-6">
                          <h4 className="font-bold text-lg mb-3">
                            Buchbare Extras
                          </h4>
                          <div className="space-y-2">
                            {vehicle.pricing.extras.map((extra, index) => (
                              <div
                                key={index}
                                className="flex justify-between items-center bg-gray-50 p-3 rounded-lg"
                              >
                                <span>{extra.name}</span>
                                <span className="font-semibold">
                                  {formatCurrency(extra.price)}{" "}
                                  {extra.priceType === "pro_Tag"
                                    ? "/Tag"
                                    : extra.priceType === "pro_Miete"
                                    ? "/Miete"
                                    : "/Person"}
                                </span>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                  </div>
                </Card>
              </Tabs.Item>

              {/* Rules Tab */}
              <Tabs.Item title="Mietbedingungen" icon={HiShieldCheck}>
                <Card>
                  <h3 className="text-2xl font-bold mb-6">
                    Vermietungsrichtlinien
                  </h3>

                  <div className="space-y-6">
                    {/* Age Requirements */}
                    <div>
                      <h4 className="font-semibold text-lg mb-3">
                        Altersanforderungen
                      </h4>
                      <div className="bg-gray-50 p-4 rounded-lg">
                        <p className="text-gray-700">
                          Mindestalter: <strong>{vehicle.rules?.minAge || 25} Jahre</strong>
                        </p>
                        <p className="text-gray-700">
                          Höchstalter: <strong>{vehicle.rules?.maxAge || 75} Jahre</strong>
                        </p>
                      </div>
                    </div>

                    {/* Rental Conditions */}
                    <div>
                      <h4 className="font-semibold text-lg mb-3">
                        Mietbedingungen
                      </h4>
                      <div className="space-y-3">
                        <div className="flex items-center">
                          {vehicle.rules?.smokingAllowed ? (
                            <HiCheck className="text-green-500 mr-2 h-6 w-6" />
                          ) : (
                            <HiX className="text-red-500 mr-2 h-6 w-6" />
                          )}
                          <span>Rauchen erlaubt</span>
                        </div>
                        <div className="flex items-center">
                          {vehicle.rules?.petsAllowed ? (
                            <HiCheck className="text-green-500 mr-2 h-6 w-6" />
                          ) : (
                            <HiX className="text-red-500 mr-2 h-6 w-6" />
                          )}
                          <span>Haustiere erlaubt</span>
                        </div>
                        <div className="flex items-center">
                          {vehicle.rules?.festivalsAllowed ? (
                            <HiCheck className="text-green-500 mr-2 h-6 w-6" />
                          ) : (
                            <HiX className="text-red-500 mr-2 h-6 w-6" />
                          )}
                          <span>Festivalnutzung erlaubt</span>
                        </div>
                        <div className="flex items-center">
                          {vehicle.rules?.foreignTravelAllowed ? (
                            <HiCheck className="text-green-500 mr-2 h-6 w-6" />
                          ) : (
                            <HiX className="text-red-500 mr-2 h-6 w-6" />
                          )}
                          <span>Auslandsreisen erlaubt</span>
                        </div>
                      </div>
                    </div>

                    {/* Allowed Countries */}
                    {vehicle.rules?.allowedCountries &&
                      vehicle.rules.allowedCountries.length > 0 && (
                        <div>
                          <h4 className="font-semibold text-lg mb-3">
                            Erlaubte Länder
                          </h4>
                          <div className="flex flex-wrap gap-2">
                            {vehicle.rules.allowedCountries.map((country, idx) => (
                              <Badge key={idx} color="info">
                                {country}
                              </Badge>
                            ))}
                          </div>
                        </div>
                      )}

                    {/* Cancellation Policy */}
                    <div>
                      <h4 className="font-semibold text-lg mb-3">
                        Stornierungsbedingungen
                      </h4>
                      <div className="bg-blue-50 p-4 rounded-lg">
                        <p className="text-gray-700">
                          <strong className="capitalize">
                            {vehicle.rules?.cancellationPolicy || "Moderat"}e
                          </strong>{" "}
                          Stornierungsrichtlinie
                        </p>
                      </div>
                    </div>

                    {/* Rental Duration */}
                    {vehicle.availability && (
                      <div>
                        <h4 className="font-semibold text-lg mb-3">
                          Mietdauer
                        </h4>
                        <div className="bg-gray-50 p-4 rounded-lg space-y-2">
                          <p className="text-gray-700">
                            Mindestmietdauer:{" "}
                            <strong>
                              {vehicle.availability.minimumRental || 2} Tage
                            </strong>
                          </p>
                          <p className="text-gray-700">
                            Maximale Mietdauer:{" "}
                            <strong>
                              {vehicle.availability.maximumRental || 30} Tage
                            </strong>
                          </p>
                        </div>
                      </div>
                    )}
                  </div>
                </Card>
              </Tabs.Item>
            </Tabs>
          </div>

          {/* Right Column - Booking Card */}
          <div className="lg:col-span-1">
            <div className="sticky top-4">
              <Card>
                <h3 className="text-2xl font-bold mb-4 text-center">
                  Jetzt buchen
                </h3>

                <div className="space-y-4">
                  {/* Date Inputs */}
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      <HiCalendar className="inline mr-2" />
                      Abholdatum
                    </label>
                    <input
                      type="date"
                      className={`w-full px-4 py-3 border-2 rounded-xl focus:ring-4 focus:outline-none ${
                        availabilityError
                          ? "border-red-500 focus:border-red-600 focus:ring-red-200"
                          : "border-gray-300 focus:border-primary-500 focus:ring-primary-200"
                      }`}
                      value={startDate}
                      onChange={(e) => {
                        setStartDate(e.target.value);
                        setAvailabilityError("");
                      }}
                      min={new Date().toISOString().split("T")[0]}
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      <HiCalendar className="inline mr-2" />
                      Rückgabedatum
                    </label>
                    <input
                      type="date"
                      className={`w-full px-4 py-3 border-2 rounded-xl focus:ring-4 focus:outline-none ${
                        availabilityError
                          ? "border-red-500 focus:border-red-600 focus:ring-red-200"
                          : "border-gray-300 focus:border-primary-500 focus:ring-primary-200"
                      }`}
                      value={endDate}
                      onChange={(e) => {
                        setEndDate(e.target.value);
                        setAvailabilityError("");
                      }}
                      min={startDate || new Date().toISOString().split("T")[0]}
                    />
                  </div>

                  {/* Availability Check Status */}
                  {checkingAvailability && (
                    <div className="flex items-center justify-center py-3">
                      <Spinner size="md" />
                      <span className="ml-2 text-gray-600">Verfügbarkeit wird geprüft...</span>
                    </div>
                  )}

                  {/* Error Message - Red Alert */}
                  {availabilityError && (
                    <Alert color="failure" icon={HiBan}>
                      <span className="font-semibold">{availabilityError}</span>
                    </Alert>
                  )}

                  {/* Price Summary */}
                  {availabilityChecked && rentalDays > 0 && (
                    <div className="bg-primary-50 p-4 rounded-xl border-2 border-primary-200">
                      <h4 className="font-bold mb-3">Preiszusammenfassung</h4>
                      <div className="space-y-2">
                        <div className="flex justify-between text-sm">
                          <span>
                            {formatCurrency(vehicle.pricing.basePrice.perDay)} x{" "}
                            {rentalDays} Tage
                          </span>
                          <span>
                            {formatCurrency(
                              vehicle.pricing.basePrice.perDay * rentalDays
                            )}
                          </span>
                        </div>
                        {vehicle.pricing.cleaningFee > 0 && (
                          <div className="flex justify-between text-sm">
                            <span>Endreinigung</span>
                            <span>
                              {formatCurrency(vehicle.pricing.cleaningFee)}
                            </span>
                          </div>
                        )}
                        <div className="border-t-2 pt-2 flex justify-between font-bold text-lg">
                          <span>Gesamt</span>
                          <span className="text-primary-600">
                            {formatCurrency(totalPrice)}
                          </span>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Booking Button - Only show if available */}
                  {availabilityChecked && isAvailable && !availabilityError && (
                    <>
                      <Alert color="success" icon={HiCheckCircle}>
                        <span className="font-semibold">Fahrzeug ist verfügbar!</span>
                      </Alert>
                      <Button
                        onClick={handleBooking}
                        className="w-full bg-green-500 hover:bg-green-600"
                        size="lg"
                        disabled={checkingAvailability}
                      >
                        <HiCheckCircle className="mr-2 h-5 w-5" />
                        Jetzt buchen
                      </Button>
                    </>
                  )}
                </div>

                {/* Additional Info */}
                <div className="mt-6 space-y-3 text-sm text-gray-600 border-t pt-4">
                  <div className="flex items-center">
                    <HiCheckCircle className="text-green-500 mr-2 flex-shrink-0" />
                    <span>Kostenlose Stornierung bis 48h vorher</span>
                  </div>
                  <div className="flex items-center">
                    <HiShieldCheck className="text-green-500 mr-2 flex-shrink-0" />
                    <span>Vollkaskoversicherung verfügbar</span>
                  </div>
                  <div className="flex items-center">
                    <HiPhone className="text-green-500 mr-2 flex-shrink-0" />
                    <span>24/7 Pannenhilfe inklusive</span>
                  </div>
                </div>

                {/* Contact Owner */}
                <div className="mt-4 pt-4 border-t">
                  <Button
                    as={Link}
                    to={`/contact?vehicle=${vehicle._id}`}
                    color="gray"
                    outline
                    className="w-full"
                  >
                    <HiMail className="mr-2" />
                    Vermieter kontaktieren
                  </Button>
                </div>
              </Card>

              {/* Owner Info */}
              {vehicle.owner && (
                <Card className="mt-4">
                  <h4 className="font-bold mb-3">Vermieter</h4>
                  <div className="flex items-center">
                    <div className="w-12 h-12 bg-primary-100 rounded-full flex items-center justify-center mr-3">
                      <span className="text-primary-600 font-bold text-lg">
                        {vehicle.owner.firstName?.[0]}
                        {vehicle.owner.lastName?.[0]}
                      </span>
                    </div>
                    <div>
                      <p className="font-semibold">
                        {vehicle.owner.firstName} {vehicle.owner.lastName}
                      </p>
                      <p className="text-sm text-gray-600">Verifizierter Vermieter</p>
                    </div>
                  </div>
                </Card>
              )}
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default VehicleDetailPage;
