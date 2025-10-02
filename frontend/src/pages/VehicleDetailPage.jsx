import { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import {
  Button,
  Card,
  Carousel,
  Tabs,
  Badge,
  Avatar,
  Spinner,
  Rating,
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
  HiClock,
  HiExclamationCircle,
} from "react-icons/hi";
import axios from "axios";

const VehicleDetailPage = () => {
  const { slug } = useParams();
  const [vehicle, setVehicle] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [availabilityChecked, setAvailabilityChecked] = useState(false);
  const [isAvailable, setIsAvailable] = useState(false);

  useEffect(() => {
    const fetchVehicleDetails = async () => {
      setLoading(true);
      try {
        const response = await axios.get(`/api/vehicles/${slug}`);
        if (response.data.success) {
          setVehicle(response.data.data);
          document.title = `${response.data.data.name} | WohnmobilTraum`;
        }
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
    if (!startDate || !endDate) {
      return;
    }

    try {
      const response = await axios.get(
        `/api/vehicles/${vehicle._id}/availability`,
        {
          params: { startDate, endDate },
        }
      );

      setIsAvailable(response.data.available);
      setAvailabilityChecked(true);
    } catch (err) {
      console.error("Error checking availability:", err);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <Spinner size="xl" />
      </div>
    );
  }

  if (error || !vehicle) {
    return (
      <div className="container mx-auto px-4 py-12">
        <Alert color="failure">
          <div className="flex items-center">
            <HiExclamationCircle className="mr-2 h-5 w-5" />
            <span>{error || "Das Fahrzeug wurde nicht gefunden."}</span>
          </div>
          <div className="mt-4">
            <Button as={Link} to="/vehicles" color="failure">
              Zurück zur Übersicht
            </Button>
          </div>
        </Alert>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Breadcrumbs */}
      <nav className="flex mb-4" aria-label="Breadcrumb">
        <ol className="inline-flex items-center space-x-1 md:space-x-3">
          <li className="inline-flex items-center">
            <Link to="/" className="text-gray-700 hover:text-blue-600">
              Startseite
            </Link>
          </li>
          <li>
            <div className="flex items-center">
              <span className="mx-2 text-gray-400">/</span>
              <Link
                to="/vehicles"
                className="text-gray-700 hover:text-blue-600"
              >
                Fahrzeuge
              </Link>
            </div>
          </li>
          <li aria-current="page">
            <div className="flex items-center">
              <span className="mx-2 text-gray-400">/</span>
              <span className="text-gray-500">{vehicle.name}</span>
            </div>
          </li>
        </ol>
      </nav>

      {/* Vehicle Header */}
      <div className="flex flex-col md:flex-row justify-between items-start mb-6">
        <div>
          <h1 className="text-3xl font-bold mb-2">{vehicle.name}</h1>
          <div className="flex items-center mb-2">
            <HiLocationMarker className="text-gray-600 mr-1" />
            <span className="text-gray-600">
              {vehicle.location?.address?.city},{" "}
              {vehicle.location?.address?.state}
            </span>
          </div>
          <div className="flex items-center">
            <Rating>
              <Rating.Star />
              <Rating.Star />
              <Rating.Star />
              <Rating.Star />
              <Rating.Star filled={false} />
            </Rating>
            <span className="ml-2 text-sm text-gray-600">
              {vehicle.reviews?.length || 0} Bewertungen
            </span>
          </div>
        </div>

        <div className="mt-4 md:mt-0">
          <div className="text-right">
            <div className="text-xl font-bold text-primary-600">
              €{vehicle.pricing.basePrice.perDay}
              <span className="text-sm text-gray-500 font-normal">/Tag</span>
            </div>
            <div className="text-sm text-gray-600">
              €{vehicle.pricing.deposit} Kaution
            </div>
          </div>
        </div>
      </div>

      {/* Vehicle Images */}
      <div className="mb-8">
        <Carousel className="h-64 md:h-96">
          {vehicle.images && vehicle.images.length > 0 ? (
            vehicle.images.map((image, index) => (
              <img
                key={index}
                src={image.url || "/src/assets/vehicle-placeholder.jpg"}
                alt={`${vehicle.name} - Bild ${index + 1}`}
                className="h-full w-full object-cover"
              />
            ))
          ) : (
            <img
              src="/src/assets/vehicle-placeholder.jpg"
              alt={vehicle.name}
              className="h-full w-full object-cover"
            />
          )}
        </Carousel>
      </div>

      {/* Main Content */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {/* Left Column - Vehicle Details */}
        <div className="md:col-span-2">
          <Tabs aria-label="Vehicle information tabs">
            <Tabs.Item active title="Beschreibung" icon={HiOfficeBuilding}>
              {/* Description */}
              <div className="mb-6">
                <p className="text-gray-700">
                  {vehicle.description || "Keine Beschreibung verfügbar."}
                </p>
              </div>

              {/* Key Features */}
              <div className="mb-6">
                <h3 className="text-lg font-semibold mb-3">Hauptmerkmale</h3>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                  <div className="flex items-center">
                    <HiUserGroup className="text-primary-600 mr-2" />
                    <span>{vehicle.capacity.seats} Sitzplätze</span>
                  </div>
                  <div className="flex items-center">
                    <HiUserGroup className="text-primary-600 mr-2" />
                    <span>{vehicle.capacity.sleepingPlaces} Schlafplätze</span>
                  </div>
                  <div className="flex items-center">
                    <HiCalendar className="text-primary-600 mr-2" />
                    <span>Baujahr {vehicle.technicalData.year}</span>
                  </div>
                  <div className="flex items-center">
                    <HiOfficeBuilding className="text-primary-600 mr-2" />
                    <span>{vehicle.technicalData.length}m Länge</span>
                  </div>
                  <div className="flex items-center">
                    <HiOfficeBuilding className="text-primary-600 mr-2" />
                    <span>
                      {vehicle.technicalData.brand}{" "}
                      {vehicle.technicalData.model}
                    </span>
                  </div>
                  <div className="flex items-center">
                    <HiShieldCheck className="text-primary-600 mr-2" />
                    <span>
                      Führerschein {vehicle.technicalData.requiredLicense}
                    </span>
                  </div>
                </div>
              </div>
            </Tabs.Item>

            <Tabs.Item title="Ausstattung" icon={HiCheckCircle}>
              {/* Equipment */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-y-6">
                {/* Kitchen */}
                <div>
                  <h4 className="font-medium text-lg mb-2">Küche</h4>
                  <ul className="space-y-1">
                    {vehicle.equipment.kitchen.available && (
                      <li className="flex items-center">
                        <HiCheckCircle className="text-green-600 mr-2" />
                        <span>Küche vorhanden</span>
                      </li>
                    )}
                    {vehicle.equipment.kitchen.refrigerator && (
                      <li className="flex items-center">
                        <HiCheckCircle className="text-green-600 mr-2" />
                        <span>Kühlschrank</span>
                      </li>
                    )}
                    {vehicle.equipment.kitchen.stove && (
                      <li className="flex items-center">
                        <HiCheckCircle className="text-green-600 mr-2" />
                        <span>Herd</span>
                      </li>
                    )}
                    {vehicle.equipment.kitchen.oven && (
                      <li className="flex items-center">
                        <HiCheckCircle className="text-green-600 mr-2" />
                        <span>Backofen</span>
                      </li>
                    )}
                    {vehicle.equipment.kitchen.microwave && (
                      <li className="flex items-center">
                        <HiCheckCircle className="text-green-600 mr-2" />
                        <span>Mikrowelle</span>
                      </li>
                    )}
                  </ul>
                </div>

                {/* Bathroom */}
                <div>
                  <h4 className="font-medium text-lg mb-2">Badezimmer</h4>
                  <ul className="space-y-1">
                    {vehicle.equipment.bathroom.available && (
                      <li className="flex items-center">
                        <HiCheckCircle className="text-green-600 mr-2" />
                        <span>Badezimmer vorhanden</span>
                      </li>
                    )}
                    {vehicle.equipment.bathroom.toilet && (
                      <li className="flex items-center">
                        <HiCheckCircle className="text-green-600 mr-2" />
                        <span>Toilette</span>
                      </li>
                    )}
                    {vehicle.equipment.bathroom.shower && (
                      <li className="flex items-center">
                        <HiCheckCircle className="text-green-600 mr-2" />
                        <span>Dusche</span>
                      </li>
                    )}
                    {vehicle.equipment.bathroom.hotWater && (
                      <li className="flex items-center">
                        <HiCheckCircle className="text-green-600 mr-2" />
                        <span>Warmwasser</span>
                      </li>
                    )}
                  </ul>
                </div>

                {/* Entertainment */}
                <div>
                  <h4 className="font-medium text-lg mb-2">Unterhaltung</h4>
                  <ul className="space-y-1">
                    {vehicle.equipment.entertainment.tv && (
                      <li className="flex items-center">
                        <HiCheckCircle className="text-green-600 mr-2" />
                        <span>Fernseher</span>
                      </li>
                    )}
                    {vehicle.equipment.entertainment.radio && (
                      <li className="flex items-center">
                        <HiCheckCircle className="text-green-600 mr-2" />
                        <span>Radio</span>
                      </li>
                    )}
                    {vehicle.equipment.entertainment.bluetooth && (
                      <li className="flex items-center">
                        <HiCheckCircle className="text-green-600 mr-2" />
                        <span>Bluetooth</span>
                      </li>
                    )}
                    {vehicle.equipment.entertainment.wifi && (
                      <li className="flex items-center">
                        <HiWifi className="text-green-600 mr-2" />
                        <span>WLAN</span>
                      </li>
                    )}
                  </ul>
                </div>

                {/* Climate */}
                <div>
                  <h4 className="font-medium text-lg mb-2">Klima</h4>
                  <ul className="space-y-1">
                    {vehicle.equipment.climate.heating && (
                      <li className="flex items-center">
                        <HiCheckCircle className="text-green-600 mr-2" />
                        <span>Heizung</span>
                      </li>
                    )}
                    {vehicle.equipment.climate.airConditioning && (
                      <li className="flex items-center">
                        <HiCheckCircle className="text-green-600 mr-2" />
                        <span>Klimaanlage</span>
                      </li>
                    )}
                  </ul>
                </div>
              </div>
            </Tabs.Item>

            <Tabs.Item title="Preise" icon={HiCurrencyEuro}>
              {/* Pricing */}
              <div className="space-y-4">
                <div className="flex justify-between items-center border-b pb-2">
                  <span>Preis pro Tag</span>
                  <span className="font-semibold">
                    €{vehicle.pricing.basePrice.perDay}
                  </span>
                </div>

                {vehicle.pricing.basePrice.perWeek && (
                  <div className="flex justify-between items-center border-b pb-2">
                    <span>Preis pro Woche</span>
                    <span className="font-semibold">
                      €{vehicle.pricing.basePrice.perWeek}
                    </span>
                  </div>
                )}

                {vehicle.pricing.basePrice.perMonth && (
                  <div className="flex justify-between items-center border-b pb-2">
                    <span>Preis pro Monat</span>
                    <span className="font-semibold">
                      €{vehicle.pricing.basePrice.perMonth}
                    </span>
                  </div>
                )}

                {/* Additional Fees */}
                <h4 className="font-medium text-lg mt-6 mb-2">
                  Zusätzliche Gebühren
                </h4>

                <div className="flex justify-between items-center border-b pb-2">
                  <span>Kaution</span>
                  <span className="font-semibold">
                    €{vehicle.pricing.deposit}
                  </span>
                </div>

                {vehicle.pricing.cleaningFee > 0 && (
                  <div className="flex justify-between items-center border-b pb-2">
                    <span>Reinigungsgebühr</span>
                    <span className="font-semibold">
                      €{vehicle.pricing.cleaningFee}
                    </span>
                  </div>
                )}

                {vehicle.pricing.serviceFee > 0 && (
                  <div className="flex justify-between items-center border-b pb-2">
                    <span>Servicegebühr</span>
                    <span className="font-semibold">
                      €{vehicle.pricing.serviceFee}
                    </span>
                  </div>
                )}

                {/* Extras */}
                {vehicle.pricing.extras &&
                  vehicle.pricing.extras.length > 0 && (
                    <>
                      <h4 className="font-medium text-lg mt-6 mb-2">Extras</h4>
                      {vehicle.pricing.extras.map((extra, index) => (
                        <div
                          key={index}
                          className="flex justify-between items-center border-b pb-2"
                        >
                          <span>{extra.name}</span>
                          <span className="font-semibold">
                            €{extra.price} {extra.perDay ? "/Tag" : ""}
                          </span>
                        </div>
                      ))}
                    </>
                  )}
              </div>
            </Tabs.Item>

            <Tabs.Item title="Bewertungen" icon={HiUserGroup}>
              {/* Reviews */}
              <div>
                {vehicle.reviews && vehicle.reviews.length > 0 ? (
                  <div className="space-y-6">
                    {vehicle.reviews.map((review, index) => (
                      <div key={index} className="border-b pb-4">
                        <div className="flex items-start">
                          <Avatar
                            img={
                              review.user.profilePicture ||
                              "/src/assets/user-placeholder.png"
                            }
                            rounded
                            className="mr-3"
                          />
                          <div>
                            <div className="font-medium">
                              {review.user.firstName} {review.user.lastName}
                            </div>
                            <div className="text-sm text-gray-500">
                              <HiClock className="inline mr-1" />
                              {new Date(review.createdAt).toLocaleDateString(
                                "de-DE"
                              )}
                            </div>
                            <div className="mt-1">
                              <Rating>
                                {[...Array(5)].map((_, i) => (
                                  <Rating.Star
                                    key={i}
                                    filled={i < review.rating}
                                  />
                                ))}
                              </Rating>
                            </div>
                            <p className="mt-2 text-gray-700">
                              {review.comment}
                            </p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-gray-600">
                    Noch keine Bewertungen für dieses Fahrzeug.
                  </p>
                )}
              </div>
            </Tabs.Item>
          </Tabs>
        </div>

        {/* Right Column - Booking Card */}
        <div>
          <Card className="sticky top-4">
            <h3 className="text-xl font-semibold mb-4">Verfügbarkeit prüfen</h3>

            <div className="space-y-4">
              <div>
                <label
                  htmlFor="startDate"
                  className="block mb-2 text-sm font-medium text-gray-900"
                >
                  Abholdatum
                </label>
                <input
                  type="date"
                  id="startDate"
                  className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  min={new Date().toISOString().split("T")[0]}
                />
              </div>

              <div>
                <label
                  htmlFor="endDate"
                  className="block mb-2 text-sm font-medium text-gray-900"
                >
                  Rückgabedatum
                </label>
                <input
                  type="date"
                  id="endDate"
                  className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  min={startDate || new Date().toISOString().split("T")[0]}
                />
              </div>

              <Button
                onClick={checkAvailability}
                color="primary"
                className="w-full"
              >
                Verfügbarkeit prüfen
              </Button>

              {availabilityChecked && (
                <Alert
                  color={isAvailable ? "success" : "failure"}
                  className="mt-3"
                >
                  {isAvailable
                    ? "Fahrzeug ist in diesem Zeitraum verfügbar!"
                    : "Leider ist das Fahrzeug in diesem Zeitraum nicht verfügbar."}
                </Alert>
              )}

              {availabilityChecked && isAvailable && (
                <Button
                  as={Link}
                  to={`/booking/new?vehicleId=${vehicle._id}&startDate=${startDate}&endDate=${endDate}`}
                  color="success"
                  className="w-full mt-3"
                >
                  Jetzt buchen
                </Button>
              )}
            </div>

            <div className="mt-4 text-center">
              <Badge color="gray">
                Kostenlose Stornierung bis zu 48 Stunden vorher
              </Badge>
            </div>

            <div className="mt-4 flex justify-between text-sm text-gray-600">
              <span>Mindestmietdauer:</span>
              <span>{vehicle.restrictions?.minRentalDays || 3} Tage</span>
            </div>

            <div className="mt-2 flex justify-between text-sm text-gray-600">
              <span>Kaution:</span>
              <span>€{vehicle.pricing.deposit}</span>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default VehicleDetailPage;
