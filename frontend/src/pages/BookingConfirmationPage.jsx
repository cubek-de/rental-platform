import React, { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { Card, Button, Spinner, Alert } from "flowbite-react";
import { HiCheckCircle, HiDownload, HiHome } from "react-icons/hi";
import api from "../services/api";

const BookingConfirmationPage = () => {
  const { bookingId } = useParams();
  const [booking, setBooking] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchBooking = async () => {
      try {
        const response = await api.get(`/api/bookings/${bookingId}`);
        setBooking(response.data.data);
      } catch (err) {
        console.error("Error fetching booking:", err);
        setError("Buchung konnte nicht geladen werden");
      } finally {
        setLoading(false);
      }
    };

    if (bookingId) {
      fetchBooking();
    }
  }, [bookingId]);

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <Spinner size="xl" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Alert color="failure">{error}</Alert>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <Card className="max-w-3xl mx-auto">
        <div className="text-center">
          <HiCheckCircle className="w-20 h-20 text-green-500 mx-auto mb-4" />
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Zahlung erfolgreich!
          </h1>
          <p className="text-lg text-gray-600 mb-6">
            Ihre Buchung wurde erfolgreich bestätigt
          </p>
        </div>

        {booking && (
          <div className="space-y-6">
            <div className="bg-gray-50 p-6 rounded-lg">
              <h2 className="text-xl font-semibold mb-4">Buchungsdetails</h2>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-gray-600">Buchungsnummer:</span>
                  <span className="font-medium">
                    {booking.bookingNumber || bookingId.substring(0, 8)}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Fahrzeug:</span>
                  <span className="font-medium">{booking.vehicle?.name}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Zeitraum:</span>
                  <span className="font-medium">
                    {new Date(booking.dates?.start).toLocaleDateString("de-DE")} -{" "}
                    {new Date(booking.dates?.end).toLocaleDateString("de-DE")}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Gesamtbetrag:</span>
                  <span className="font-bold text-lg">
                    €{booking.pricing?.totalAmount?.toFixed(2)}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Status:</span>
                  <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-green-100 text-green-800">
                    Bestätigt
                  </span>
                </div>
              </div>
            </div>

            <Alert color="info">
              <p>
                Eine Bestätigungs-E-Mail wurde an{" "}
                <strong>{booking.user?.email || booking.contactInfo?.email}</strong>{" "}
                gesendet.
              </p>
            </Alert>

            <div className="flex flex-col sm:flex-row gap-4">
              <Button
                as={Link}
                to="/dashboard"
                className="flex-1 bg-primary-600 hover:bg-primary-700"
                size="lg"
              >
                <HiHome className="mr-2 h-5 w-5" />
                Zum Dashboard
              </Button>
              <Button
                color="light"
                onClick={() => window.print()}
                className="flex-1"
                size="lg"
              >
                <HiDownload className="mr-2 h-5 w-5" />
                Bestätigung drucken
              </Button>
            </div>
          </div>
        )}
      </Card>
    </div>
  );
};

export default BookingConfirmationPage;
