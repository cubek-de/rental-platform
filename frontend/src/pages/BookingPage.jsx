import { useState, useEffect, useCallback, useContext } from "react";
import { useSearchParams, useNavigate, useParams } from "react-router-dom";
import {
  Card,
  Button,
  TextInput,
  Alert,
  Spinner,
  Progress,
} from "flowbite-react";
import {
  HiUserCircle,
  HiCurrencyEuro,
  HiInformationCircle,
  HiDocumentText,
  HiCheck,
} from "react-icons/hi";
import axios from "axios";
import { loadStripe } from "@stripe/stripe-js";
import { Elements } from "@stripe/react-stripe-js";
import StripePaymentForm from "../components/booking/StripePaymentForm";
import { AuthContext } from "../context/AuthContext";

// Don't initialize Stripe until needed (prevents adblocker errors)
let stripePromise = null;
const getStripe = () => {
  if (!stripePromise && import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY) {
    stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY);
  }
  return stripePromise;
};

const BookingPage = () => {
  const [searchParams] = useSearchParams();
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useContext(AuthContext);
  const [currentStep, setCurrentStep] = useState(1);
  const [vehicle, setVehicle] = useState(null);

  // Get vehicle identifier - could be slug from query or id from route
  const vehicleSlug = searchParams.get("vehicleSlug") || id || "";

  // Get dates from URL params
  const urlStartDate = searchParams.get("startDate") || "";
  const urlEndDate = searchParams.get("endDate") || "";

  const [booking, setBooking] = useState({
    vehicleId: "", // Will be set after fetching vehicle
    startDate: urlStartDate,
    endDate: urlEndDate,
    guestInfo: {
      adults: 1,
      children: 0,
      pets: 0,
    },
    driverInfo: {
      firstName: "",
      lastName: "",
      licenseNumber: "",
      licenseCountry: "Deutschland",
      licenseExpiry: "",
      dateOfBirth: "",
      licenseCategory: "B",
    },
    contactInfo: {
      email: "",
      phone: "",
      address: {
        street: "",
        city: "",
        postalCode: "",
        country: "Deutschland",
      },
    },
    insurance: "standard", // Default to standard insurance
    extras: [],
    paymentMethod: "stripe",
    paymentOption: "full", // "full" or "split"
    acceptedTerms: false,
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [priceSummary, setPriceSummary] = useState({
    days: 0,
    basePrice: 0,
    extras: [],
    cleaningFee: 0,
    serviceFee: 0,
    total: 0,
  });

  // Define calculatePriceSummary BEFORE using it in useEffect
  const calculatePriceSummary = useCallback(
    (vehicleData) => {
      if (!booking.startDate || !booking.endDate || !vehicleData) {
        return;
      }

      // Check if pricing exists and has required fields
      if (!vehicleData.pricing || !vehicleData.pricing.basePrice || !vehicleData.pricing.basePrice.perDay) {
        console.error('Vehicle pricing data is missing or incomplete:', vehicleData);
        setError('Fahrzeugpreisdaten sind nicht verfügbar');
        return;
      }

      const start = new Date(booking.startDate);
      const end = new Date(booking.endDate);
      const days = Math.ceil((end - start) / (1000 * 60 * 60 * 24));

      if (days <= 0) {
        return;
      }

      const basePrice = vehicleData.pricing.basePrice.perDay * days;
      const cleaningFee = vehicleData.pricing.cleaningFee || 0;
      const serviceFee = vehicleData.pricing.serviceFee || 0;

      setPriceSummary({
        days,
        basePrice,
        extras: [],
        cleaningFee,
        serviceFee,
        total: basePrice + cleaningFee + serviceFee,
      });
    },
    [booking.startDate, booking.endDate]
  );

  // Update dates from URL params when they change
  useEffect(() => {
    if (urlStartDate || urlEndDate) {
      setBooking(prev => ({
        ...prev,
        startDate: urlStartDate,
        endDate: urlEndDate,
      }));
    }
  }, [urlStartDate, urlEndDate]);

  // Pre-fill user data if authenticated
  useEffect(() => {
    if (user) {
      setBooking(prev => ({
        ...prev,
        driverInfo: {
          ...prev.driverInfo,
          firstName: user.firstName || "",
          lastName: user.lastName || "",
        },
        contactInfo: {
          ...prev.contactInfo,
          email: user.email || "",
          phone: user.profile?.phone || "",
          address: {
            street: user.profile?.address?.street || "",
            city: user.profile?.address?.city || "",
            postalCode: user.profile?.address?.postalCode || "",
            country: user.profile?.address?.country || "Deutschland",
          },
        },
      }));
    }
  }, [user]);

  useEffect(() => {
    document.title = "Buchung | WohnmobilTraum";

    const fetchVehicleDetails = async () => {
      if (!vehicleSlug) {
        setError("Keine Fahrzeug-ID angegeben");
        setLoading(false);
        return;
      }

      try {
        const response = await axios.get(
          `${import.meta.env.VITE_API_URL}/api/vehicles/${vehicleSlug}`
        );
        if (response.data.success) {
          // API returns {vehicle: {...}, bookedDates: [...]}
          const { vehicle: vehicleData } = response.data.data;
          setVehicle(vehicleData);
          // Set the vehicle ID in booking state
          setBooking(prev => ({ ...prev, vehicleId: vehicleData._id }));
          calculatePriceSummary(vehicleData);
        } else {
          setError("Fahrzeug nicht gefunden");
        }
      } catch (err) {
        console.error("Error fetching vehicle details:", err);
        console.error("Full error:", err.response || err);
        setError(
          err.response?.data?.message ||
          "Das Fahrzeug konnte nicht geladen werden. Bitte versuchen Sie es erneut."
        );
      } finally {
        setLoading(false);
      }
    };

    fetchVehicleDetails();
  }, [
    vehicleSlug,
    booking.startDate,
    booking.endDate,
    calculatePriceSummary,
  ]);

  const handleNextStep = () => {
    setCurrentStep((prev) => Math.min(prev + 1, 4));
  };

  const handlePrevStep = () => {
    setCurrentStep((prev) => Math.max(prev - 1, 1));
  };

  const handleInputChange = (section, field, value) => {
    setBooking((prev) => ({
      ...prev,
      [section]: {
        ...prev[section],
        [field]: value,
      },
    }));
  };

  const handleAddressChange = (field, value) => {
    setBooking((prev) => ({
      ...prev,
      contactInfo: {
        ...prev.contactInfo,
        address: {
          ...prev.contactInfo.address,
          [field]: value,
        },
      },
    }));
  };

  const [createdBooking, setCreatedBooking] = useState(null);
  const [clientSecret, setClientSecret] = useState(null);

  const handleCreateBooking = async () => {
    try {
      setLoading(true);
      setError(null);

      // Prepare booking data with proper formatting
      const bookingData = {
        vehicleId: booking.vehicleId,
        startDate: booking.startDate, // Already in YYYY-MM-DD from date input
        endDate: booking.endDate,
        guestInfo: booking.guestInfo,
        driverInfo: booking.driverInfo,
        contactInfo: booking.contactInfo,
        insurance: booking.insurance,
        extras: booking.extras || [],
        paymentMethod: booking.paymentMethod,
        paymentOption: booking.paymentOption,
      };

      console.log("Creating booking with data:", bookingData);

      const response = await axios.post(
        `${import.meta.env.VITE_API_URL}/api/bookings`,
        bookingData,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('token')}`,
          },
        }
      );

      if (response.data.success) {
        const newBooking = response.data.data;
        setCreatedBooking(newBooking);

        // Create payment intent and get client secret
        const paymentResponse = await axios.post(
          `${import.meta.env.VITE_API_URL}/api/payment/create-payment-intent`,
          {
            bookingId: newBooking._id,
            amount: booking.paymentOption === "split" ? priceSummary.total * 0.5 : priceSummary.total,
            paymentOption: booking.paymentOption,
          },
          {
            headers: {
              Authorization: `Bearer ${localStorage.getItem('token')}`,
            },
          }
        );

        if (paymentResponse.data.success) {
          setClientSecret(paymentResponse.data.data.clientSecret);
        }

        return newBooking;
      }
    } catch (err) {
      console.error("Error creating booking:", err);
      console.error("Full error:", err.response || err);

      // Show detailed validation errors if available
      if (err.response?.data?.errors) {
        const errorMessages = err.response.data.errors.map(e => e.msg).join(", ");
        setError(`Validierungsfehler: ${errorMessages}`);
      } else {
        setError(
          err.response?.data?.message ||
            "Die Buchung konnte nicht erstellt werden."
        );
      }
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // Create booking when moving to payment step
  const handleMoveToPaymentStep = async () => {
    // Validate required fields
    if (!booking.driverInfo.firstName || !booking.driverInfo.lastName) {
      setError("Bitte füllen Sie Vor- und Nachname aus");
      return;
    }
    if (!booking.driverInfo.licenseNumber) {
      setError("Bitte geben Sie Ihre Führerscheinnummer ein");
      return;
    }
    if (!booking.contactInfo.email || !booking.contactInfo.phone) {
      setError("Bitte füllen Sie E-Mail und Telefonnummer aus");
      return;
    }
    if (!booking.vehicleId) {
      setError("Fahrzeug-ID fehlt. Bitte laden Sie die Seite neu.");
      return;
    }

    if (!createdBooking) {
      const newBooking = await handleCreateBooking();
      if (newBooking) {
        setCurrentStep(4);
      }
    } else {
      setCurrentStep(4);
    }
  };

  // Check if user is authenticated
  useEffect(() => {
    if (!user && !loading) {
      // Construct redirect URL with dates
      const redirectUrl = `/booking/${vehicleSlug}?startDate=${booking.startDate}&endDate=${booking.endDate}`;
      const encodedRedirect = encodeURIComponent(redirectUrl);
      navigate(`/login?redirect=${encodedRedirect}`);
    }
  }, [user, loading, navigate, vehicleSlug, booking.startDate, booking.endDate]);

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <Spinner size="xl" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto px-4 py-12">
        <Alert color="failure" className="mb-4">
          {error}
        </Alert>
        <Button as="a" href="/vehicles" color="gray">
          Zurück zur Fahrzeugübersicht
        </Button>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="text-center">
          <Spinner size="xl" />
          <p className="mt-4">Weiterleitung zur Anmeldung...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8">Fahrzeug buchen</h1>

      {/* Error Alert */}
      {error && (
        <Alert color="failure" className="mb-6" onDismiss={() => setError(null)}>
          <span className="font-medium">Fehler:</span> {error}
        </Alert>
      )}

      <div className="mb-8">
        {/* Custom Stepper */}
        <div className="flex items-center justify-between mb-8">
          {[
            { icon: HiInformationCircle, label: "Daten", step: 1 },
            { icon: HiUserCircle, label: "Persönliche Angaben", step: 2 },
            { icon: HiCurrencyEuro, label: "Bezahlung", step: 3 },
            { icon: HiCheck, label: "Bestätigung", step: 4 },
          ].map((stepItem, index) => (
            <div key={index} className="flex items-center flex-1">
              <div className="flex flex-col items-center">
                <div
                  className={`flex items-center justify-center w-10 h-10 rounded-full border-2 ${
                    currentStep >= stepItem.step
                      ? "bg-blue-600 border-blue-600 text-white"
                      : "border-gray-300 text-gray-400"
                  }`}
                >
                  <stepItem.icon className="w-5 h-5" />
                </div>
                <span
                  className={`mt-2 text-sm font-medium ${
                    currentStep >= stepItem.step
                      ? "text-blue-600"
                      : "text-gray-400"
                  }`}
                >
                  {stepItem.label}
                </span>
              </div>
              {index < 3 && (
                <div
                  className={`flex-1 h-0.5 mx-4 ${
                    currentStep > stepItem.step ? "bg-blue-600" : "bg-gray-300"
                  }`}
                />
              )}
            </div>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        <div className="md:col-span-2">
          {currentStep === 1 && (
            <Card>
              <h2 className="text-xl font-semibold mb-4">Buchungsdetails</h2>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                <div>
                  <label className="block mb-1 text-sm font-medium">
                    Abholdatum
                  </label>
                  <input
                    type="date"
                    className="w-full rounded-lg border border-gray-300 p-2.5"
                    value={booking.startDate}
                    onChange={(e) =>
                      setBooking({ ...booking, startDate: e.target.value })
                    }
                    min={new Date().toISOString().split("T")[0]}
                  />
                </div>
                <div>
                  <label className="block mb-1 text-sm font-medium">
                    Rückgabedatum
                  </label>
                  <input
                    type="date"
                    className="w-full rounded-lg border border-gray-300 p-2.5"
                    value={booking.endDate}
                    onChange={(e) =>
                      setBooking({ ...booking, endDate: e.target.value })
                    }
                    min={
                      booking.startDate ||
                      new Date().toISOString().split("T")[0]
                    }
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-4 mb-6">
                <div>
                  <label className="block mb-1 text-sm font-medium">
                    Erwachsene
                  </label>
                  <select
                    className="w-full rounded-lg border border-gray-300 p-2.5"
                    value={booking.guestInfo.adults}
                    onChange={(e) =>
                      handleInputChange(
                        "guestInfo",
                        "adults",
                        parseInt(e.target.value)
                      )
                    }
                  >
                    {[1, 2, 3, 4, 5, 6].map((num) => (
                      <option key={num} value={num}>
                        {num}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block mb-1 text-sm font-medium">
                    Kinder
                  </label>
                  <select
                    className="w-full rounded-lg border border-gray-300 p-2.5"
                    value={booking.guestInfo.children}
                    onChange={(e) =>
                      handleInputChange(
                        "guestInfo",
                        "children",
                        parseInt(e.target.value)
                      )
                    }
                  >
                    {[0, 1, 2, 3, 4].map((num) => (
                      <option key={num} value={num}>
                        {num}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block mb-1 text-sm font-medium">
                    Haustiere
                  </label>
                  <select
                    className="w-full rounded-lg border border-gray-300 p-2.5"
                    value={booking.guestInfo.pets}
                    onChange={(e) =>
                      handleInputChange(
                        "guestInfo",
                        "pets",
                        parseInt(e.target.value)
                      )
                    }
                  >
                    {[0, 1, 2].map((num) => (
                      <option key={num} value={num}>
                        {num}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="flex justify-end mt-6">
                <Button
                  onClick={handleNextStep}
                  disabled={!booking.startDate || !booking.endDate}
                  className="bg-primary-600 hover:bg-primary-700"
                  size="lg"
                >
                  Weiter
                </Button>
              </div>

              {/* Debug info - remove after testing */}
              {(!booking.startDate || !booking.endDate) && (
                <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg text-sm">
                  <p className="font-medium text-yellow-800">Button deaktiviert:</p>
                  <p className="text-yellow-700">
                    Startdatum: {booking.startDate || "Nicht gesetzt"}<br />
                    Enddatum: {booking.endDate || "Nicht gesetzt"}
                  </p>
                </div>
              )}
            </Card>
          )}

          {currentStep === 2 && (
            <Card>
              <h2 className="text-xl font-semibold mb-4">
                Persönliche Angaben
              </h2>

              <div className="mb-6">
                <h3 className="text-lg font-medium mb-3">
                  Fahrer-Informationen
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block mb-1 text-sm font-medium">
                      Vorname
                    </label>
                    <TextInput
                      value={booking.driverInfo.firstName}
                      onChange={(e) =>
                        handleInputChange(
                          "driverInfo",
                          "firstName",
                          e.target.value
                        )
                      }
                    />
                  </div>
                  <div>
                    <label className="block mb-1 text-sm font-medium">
                      Nachname
                    </label>
                    <TextInput
                      value={booking.driverInfo.lastName}
                      onChange={(e) =>
                        handleInputChange(
                          "driverInfo",
                          "lastName",
                          e.target.value
                        )
                      }
                    />
                  </div>
                  <div>
                    <label className="block mb-1 text-sm font-medium">
                      Führerscheinnummer
                    </label>
                    <TextInput
                      value={booking.driverInfo.licenseNumber}
                      onChange={(e) =>
                        handleInputChange(
                          "driverInfo",
                          "licenseNumber",
                          e.target.value
                        )
                      }
                    />
                  </div>
                  <div>
                    <label className="block mb-1 text-sm font-medium">
                      Führerschein gültig bis
                    </label>
                    <input
                      type="date"
                      className="w-full rounded-lg border border-gray-300 p-2.5"
                      value={booking.driverInfo.licenseExpiry}
                      onChange={(e) =>
                        handleInputChange(
                          "driverInfo",
                          "licenseExpiry",
                          e.target.value
                        )
                      }
                      min={new Date().toISOString().split("T")[0]}
                    />
                  </div>
                </div>
              </div>

              <div className="mb-6">
                <h3 className="text-lg font-medium mb-3">
                  Kontaktinformationen
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block mb-1 text-sm font-medium">
                      E-Mail
                    </label>
                    <TextInput
                      type="email"
                      value={booking.contactInfo.email}
                      onChange={(e) =>
                        handleInputChange(
                          "contactInfo",
                          "email",
                          e.target.value
                        )
                      }
                    />
                  </div>
                  <div>
                    <label className="block mb-1 text-sm font-medium">
                      Telefon
                    </label>
                    <TextInput
                      type="tel"
                      value={booking.contactInfo.phone}
                      onChange={(e) =>
                        handleInputChange(
                          "contactInfo",
                          "phone",
                          e.target.value
                        )
                      }
                    />
                  </div>
                </div>
              </div>

              <div className="mb-6">
                <h3 className="text-lg font-medium mb-3">Adresse</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="md:col-span-2">
                    <label className="block mb-1 text-sm font-medium">
                      Straße & Hausnummer
                    </label>
                    <TextInput
                      value={booking.contactInfo.address.street}
                      onChange={(e) =>
                        handleAddressChange("street", e.target.value)
                      }
                    />
                  </div>
                  <div>
                    <label className="block mb-1 text-sm font-medium">
                      PLZ
                    </label>
                    <TextInput
                      value={booking.contactInfo.address.postalCode}
                      onChange={(e) =>
                        handleAddressChange("postalCode", e.target.value)
                      }
                    />
                  </div>
                  <div>
                    <label className="block mb-1 text-sm font-medium">
                      Ort
                    </label>
                    <TextInput
                      value={booking.contactInfo.address.city}
                      onChange={(e) =>
                        handleAddressChange("city", e.target.value)
                      }
                    />
                  </div>
                </div>
              </div>

              <div className="flex justify-between">
                <Button color="gray" onClick={handlePrevStep}>
                  Zurück
                </Button>
                <Button
                  onClick={handleNextStep}
                  className="bg-primary-600 hover:bg-primary-700 text-white"
                  size="lg"
                >
                  Weiter
                </Button>
              </div>
            </Card>
          )}

          {currentStep === 3 && (
            <Card>
              <h2 className="text-xl font-semibold mb-4">
                Zahlungsinformationen
              </h2>

              <div className="mb-6">
                <h3 className="text-lg font-medium mb-3">Zahlungsoption</h3>
                <div className="space-y-3">
                  <div className="border rounded-lg p-4">
                    <div className="flex items-center mb-2">
                      <input
                        type="radio"
                        id="fullPayment"
                        name="paymentOption"
                        value="full"
                        checked={booking.paymentOption === "full"}
                        onChange={() =>
                          setBooking({ ...booking, paymentOption: "full" })
                        }
                        className="mr-3"
                      />
                      <label htmlFor="fullPayment" className="flex-1">
                        <span className="font-medium">Vollzahlung online</span>
                        <p className="text-sm text-gray-600">
                          Bezahlen Sie den gesamten Betrag von €
                          {priceSummary.total.toFixed(2)} jetzt online
                        </p>
                      </label>
                    </div>
                  </div>

                  <div className="border rounded-lg p-4">
                    <div className="flex items-center mb-2">
                      <input
                        type="radio"
                        id="splitPayment"
                        name="paymentOption"
                        value="split"
                        checked={booking.paymentOption === "split"}
                        onChange={() =>
                          setBooking({ ...booking, paymentOption: "split" })
                        }
                        className="mr-3"
                      />
                      <label htmlFor="splitPayment" className="flex-1">
                        <span className="font-medium">
                          Teilzahlung (50% online, 50% bar)
                        </span>
                        <p className="text-sm text-gray-600">
                          Bezahlen Sie €{(priceSummary.total * 0.5).toFixed(2)}{" "}
                          online und den Rest bei Abholung in bar
                        </p>
                      </label>
                    </div>
                  </div>
                </div>
              </div>

              <div className="mb-6">
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id="acceptedTerms"
                    checked={booking.acceptedTerms}
                    onChange={() =>
                      setBooking({
                        ...booking,
                        acceptedTerms: !booking.acceptedTerms,
                      })
                    }
                    className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
                  />
                  <label htmlFor="acceptedTerms" className="ml-2 text-sm">
                    Ich akzeptiere die{" "}
                    <a href="/terms" className="text-blue-600 hover:underline">
                      AGB
                    </a>{" "}
                    und{" "}
                    <a
                      href="/privacy"
                      className="text-blue-600 hover:underline"
                    >
                      Datenschutzbestimmungen
                    </a>
                  </label>
                </div>
              </div>

              <div className="flex justify-between">
                <Button color="gray" onClick={handlePrevStep}>
                  Zurück
                </Button>
                <Button
                  onClick={handleMoveToPaymentStep}
                  disabled={!booking.acceptedTerms || loading}
                  className="bg-primary-600 hover:bg-primary-700 text-white disabled:bg-gray-400"
                  size="lg"
                >
                  {loading ? (
                    <>
                      <Spinner size="sm" className="mr-2" />
                      Buchung wird erstellt...
                    </>
                  ) : (
                    "Weiter zur Zahlung"
                  )}
                </Button>
              </div>
            </Card>
          )}

          {currentStep === 4 && (
            <Card>
              <h2 className="text-xl font-semibold mb-4">
                Zahlung & Buchungsabschluss
              </h2>

              <div className="space-y-6">
                <div>
                  <h3 className="text-lg font-medium mb-3">Zusammenfassung</h3>
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <div className="flex justify-between items-center mb-2">
                      <span>Fahrzeug:</span>
                      <span className="font-medium">{vehicle?.name}</span>
                    </div>
                    <div className="flex justify-between items-center mb-2">
                      <span>Zeitraum:</span>
                      <span className="font-medium">
                        {new Date(booking.startDate).toLocaleDateString(
                          "de-DE"
                        )}{" "}
                        bis{" "}
                        {new Date(booking.endDate).toLocaleDateString("de-DE")}
                      </span>
                    </div>
                    <div className="flex justify-between items-center mb-2">
                      <span>Anzahl Tage:</span>
                      <span className="font-medium">{priceSummary.days}</span>
                    </div>
                    <div className="flex justify-between items-center pt-2 border-t">
                      <span>Zahlungsoption:</span>
                      <span className="font-medium">
                        {booking.paymentOption === "full"
                          ? "Vollzahlung"
                          : "Teilzahlung (50/50)"}
                      </span>
                    </div>
                  </div>
                </div>

                <Alert color="info">
                  <HiInformationCircle className="mr-2 h-5 w-5" />
                  <span>
                    Die Kaution in Höhe von €{vehicle?.pricing?.deposit || 0} wird bei
                    Abholung des Fahrzeugs fällig.
                  </span>
                </Alert>

                {createdBooking && clientSecret ? (
                  <div className="border-t pt-6">
                    <h3 className="text-lg font-medium mb-4">Zahlungsinformationen</h3>
                    <Elements
                      stripe={getStripe()}
                      options={{
                        clientSecret: clientSecret,
                        appearance: {
                          theme: 'stripe',
                        },
                      }}
                    >
                      <StripePaymentForm
                        bookingId={createdBooking._id}
                        amount={
                          booking.paymentOption === "split"
                            ? priceSummary.total * 0.5
                            : priceSummary.total
                        }
                        paymentOption={booking.paymentOption}
                        onSuccess={(data) => {
                          // Navigate to confirmation page
                          navigate(`/booking/confirmation/${data.booking.bookingNumber}`);
                        }}
                        onError={(error) => {
                          setError(error.message || "Zahlung fehlgeschlagen");
                        }}
                      />
                    </Elements>
                  </div>
                ) : (
                  <div className="flex justify-center py-8">
                    <Spinner size="xl" />
                    <span className="ml-3">Buchung wird vorbereitet...</span>
                  </div>
                )}

                <div className="flex justify-between">
                  <Button color="light" onClick={handlePrevStep}>
                    Zurück
                  </Button>
                </div>
              </div>
            </Card>
          )}
        </div>

        {/* Price Summary Card */}
        <div>
          <Card className="sticky top-4">
            <h3 className="text-xl font-semibold mb-4">Preisübersicht</h3>

            <div className="space-y-3 mb-4">
              <div className="flex justify-between">
                <span>
                  €{vehicle?.pricing?.basePrice?.perDay || 0} × {priceSummary.days}{" "}
                  Tage
                </span>
                <span>€{priceSummary.basePrice.toFixed(2)}</span>
              </div>

              {priceSummary.cleaningFee > 0 && (
                <div className="flex justify-between">
                  <span>Reinigungsgebühr</span>
                  <span>€{priceSummary.cleaningFee.toFixed(2)}</span>
                </div>
              )}

              {priceSummary.serviceFee > 0 && (
                <div className="flex justify-between">
                  <span>Servicegebühr</span>
                  <span>€{priceSummary.serviceFee.toFixed(2)}</span>
                </div>
              )}

              <div className="border-t pt-2 font-bold">
                <div className="flex justify-between">
                  <span>Gesamtpreis</span>
                  <span>€{priceSummary.total.toFixed(2)}</span>
                </div>
              </div>
            </div>

            <div className="text-sm text-gray-600 mb-4">
              <p className="mb-2">
                <strong>Kaution:</strong> €{vehicle?.pricing?.deposit || 0}
                <span className="block mt-1">
                  Die Kaution wird bei Abholung des Fahrzeugs hinterlegt und
                  nach Rückgabe erstattet, sofern das Fahrzeug unbeschädigt ist.
                </span>
              </p>

              <p>
                <strong>Stornierungsbedingungen:</strong>
                <span className="block mt-1">
                  Kostenlose Stornierung bis zu 48 Stunden vor Abholung. Bei
                  späterer Stornierung oder Nichterscheinen wird eine Gebühr von
                  50% des Gesamtpreises berechnet.
                </span>
              </p>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default BookingPage;
