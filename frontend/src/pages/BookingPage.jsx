import { useState, useEffect, useCallback } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
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

const BookingPage = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState(1);
  const [vehicle, setVehicle] = useState(null);
  const [booking, setBooking] = useState({
    vehicleId: searchParams.get("vehicleId") || "",
    startDate: searchParams.get("startDate") || "",
    endDate: searchParams.get("endDate") || "",
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
    paymentMethod: "stripe",
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

  useEffect(() => {
    document.title = "Buchung | WohnmobilTraum";

    const fetchVehicleDetails = async () => {
      if (!booking.vehicleId) {
        setError("Keine Fahrzeug-ID angegeben");
        setLoading(false);
        return;
      }

      try {
        const response = await axios.get(`/api/vehicles/${booking.vehicleId}`);
        if (response.data.success) {
          setVehicle(response.data.data);
          calculatePriceSummary(response.data.data);
        }
      } catch (err) {
        console.error("Error fetching vehicle details:", err);
        setError("Das Fahrzeug konnte nicht geladen werden.");
      } finally {
        setLoading(false);
      }
    };

    fetchVehicleDetails();
  }, [
    booking.vehicleId,
    booking.startDate,
    booking.endDate,
    calculatePriceSummary,
  ]);

  const calculatePriceSummary = useCallback(
    (vehicleData) => {
      if (!booking.startDate || !booking.endDate || !vehicleData) {
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

  const handleSubmitBooking = async () => {
    try {
      setLoading(true);
      const response = await axios.post("/api/bookings", booking);
      if (response.data.success) {
        navigate(`/booking/confirmation/${response.data.data.bookingNumber}`);
      }
    } catch (err) {
      console.error("Error creating booking:", err);
      setError(
        err.response?.data?.message ||
          "Die Buchung konnte nicht erstellt werden."
      );
    } finally {
      setLoading(false);
    }
  };

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

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8">Fahrzeug buchen</h1>

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

              <div className="flex justify-end">
                <Button
                  onClick={handleNextStep}
                  disabled={!booking.startDate || !booking.endDate}
                >
                  Weiter
                </Button>
              </div>
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
                <Button color="light" onClick={handlePrevStep}>
                  Zurück
                </Button>
                <Button onClick={handleNextStep}>Weiter</Button>
              </div>
            </Card>
          )}

          {currentStep === 3 && (
            <Card>
              <h2 className="text-xl font-semibold mb-4">
                Zahlungsinformationen
              </h2>

              <div className="mb-6">
                <h3 className="text-lg font-medium mb-3">
                  Zahlungsmethode wählen
                </h3>
                <div className="space-y-3">
                  <div className="flex items-center">
                    <input
                      type="radio"
                      id="stripe"
                      name="paymentMethod"
                      value="stripe"
                      checked={booking.paymentMethod === "stripe"}
                      onChange={() =>
                        setBooking({ ...booking, paymentMethod: "stripe" })
                      }
                      className="mr-2"
                    />
                    <label htmlFor="stripe" className="flex items-center">
                      <span className="mr-2">Kreditkarte</span>
                      <img
                        src="/src/assets/visa.svg"
                        alt="Visa"
                        className="h-6 mr-1"
                      />
                      <img
                        src="/src/assets/mastercard.svg"
                        alt="Mastercard"
                        className="h-6"
                      />
                    </label>
                  </div>

                  <div className="flex items-center">
                    <input
                      type="radio"
                      id="paypal"
                      name="paymentMethod"
                      value="paypal"
                      checked={booking.paymentMethod === "paypal"}
                      onChange={() =>
                        setBooking({ ...booking, paymentMethod: "paypal" })
                      }
                      className="mr-2"
                    />
                    <label htmlFor="paypal" className="flex items-center">
                      <span className="mr-2">PayPal</span>
                      <img
                        src="/src/assets/paypal.svg"
                        alt="PayPal"
                        className="h-6"
                      />
                    </label>
                  </div>

                  <div className="flex items-center">
                    <input
                      type="radio"
                      id="bank_transfer"
                      name="paymentMethod"
                      value="bank_transfer"
                      checked={booking.paymentMethod === "bank_transfer"}
                      onChange={() =>
                        setBooking({
                          ...booking,
                          paymentMethod: "bank_transfer",
                        })
                      }
                      className="mr-2"
                    />
                    <label htmlFor="bank_transfer">Überweisung</label>
                  </div>
                </div>
              </div>

              {booking.paymentMethod === "stripe" && (
                <div className="bg-gray-50 p-4 rounded-lg mb-6">
                  <h4 className="font-medium mb-3">Kreditkartendaten</h4>
                  <div className="space-y-4">
                    <div>
                      <label className="block mb-1 text-sm font-medium">
                        Kartennummer
                      </label>
                      <TextInput placeholder="1234 5678 9012 3456" />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block mb-1 text-sm font-medium">
                          Ablaufdatum
                        </label>
                        <TextInput placeholder="MM / JJ" />
                      </div>
                      <div>
                        <label className="block mb-1 text-sm font-medium">
                          CVC
                        </label>
                        <TextInput placeholder="123" />
                      </div>
                    </div>
                    <div>
                      <label className="block mb-1 text-sm font-medium">
                        Karteninhaber
                      </label>
                      <TextInput placeholder="Max Mustermann" />
                    </div>
                  </div>
                </div>
              )}

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
                <Button color="light" onClick={handlePrevStep}>
                  Zurück
                </Button>
                <Button
                  onClick={handleNextStep}
                  disabled={!booking.acceptedTerms}
                >
                  Weiter
                </Button>
              </div>
            </Card>
          )}

          {currentStep === 4 && (
            <Card>
              <h2 className="text-xl font-semibold mb-4">
                Buchungsbestätigung
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
                    <div className="flex justify-between items-center">
                      <span>Anzahl Tage:</span>
                      <span className="font-medium">{priceSummary.days}</span>
                    </div>
                  </div>
                </div>

                <div>
                  <h3 className="text-lg font-medium mb-3">
                    Persönliche Daten
                  </h3>
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-y-2">
                      <div>
                        <span className="text-gray-600">Name:</span>
                        <span className="font-medium ml-2">
                          {booking.driverInfo.firstName}{" "}
                          {booking.driverInfo.lastName}
                        </span>
                      </div>
                      <div>
                        <span className="text-gray-600">E-Mail:</span>
                        <span className="font-medium ml-2">
                          {booking.contactInfo.email}
                        </span>
                      </div>
                      <div>
                        <span className="text-gray-600">Telefon:</span>
                        <span className="font-medium ml-2">
                          {booking.contactInfo.phone}
                        </span>
                      </div>
                      <div>
                        <span className="text-gray-600">Führerschein:</span>
                        <span className="font-medium ml-2">
                          {booking.driverInfo.licenseNumber}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                <div>
                  <h3 className="text-lg font-medium mb-3">Zahlungsart</h3>
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <div className="font-medium">
                      {booking.paymentMethod === "stripe" && "Kreditkarte"}
                      {booking.paymentMethod === "paypal" && "PayPal"}
                      {booking.paymentMethod === "bank_transfer" &&
                        "Überweisung"}
                    </div>
                  </div>
                </div>

                <Alert color="info">
                  <HiInformationCircle className="mr-2 h-5 w-5" />
                  <span>
                    Die Kaution in Höhe von €{vehicle?.pricing.deposit} wird bei
                    Abholung des Fahrzeugs fällig.
                  </span>
                </Alert>

                <Button
                  onClick={handleSubmitBooking}
                  color="success"
                  className="w-full"
                  disabled={loading}
                >
                  {loading ? (
                    <>
                      <Spinner size="sm" light={true} />
                      <span className="ml-2">Wird verarbeitet...</span>
                    </>
                  ) : (
                    <>
                      <HiDocumentText className="mr-2 h-5 w-5" />
                      Buchung abschließen
                    </>
                  )}
                </Button>
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
                  €{vehicle?.pricing.basePrice.perDay} × {priceSummary.days}{" "}
                  Tage
                </span>
                <span>€{priceSummary.basePrice}</span>
              </div>

              {priceSummary.cleaningFee > 0 && (
                <div className="flex justify-between">
                  <span>Reinigungsgebühr</span>
                  <span>€{priceSummary.cleaningFee}</span>
                </div>
              )}

              {priceSummary.serviceFee > 0 && (
                <div className="flex justify-between">
                  <span>Servicegebühr</span>
                  <span>€{priceSummary.serviceFee}</span>
                </div>
              )}

              <div className="border-t pt-2 font-bold">
                <div className="flex justify-between">
                  <span>Gesamtpreis</span>
                  <span>€{priceSummary.total}</span>
                </div>
              </div>
            </div>

            <div className="text-sm text-gray-600 mb-4">
              <p className="mb-2">
                <strong>Kaution:</strong> €{vehicle?.pricing.deposit}
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
