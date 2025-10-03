import React, { useState, useEffect, useCallback } from "react";
import { Button, Card, Pagination, Badge, Spinner } from "flowbite-react";
import api from "../../services/api";
import { FiEye, FiDownload, FiX } from "react-icons/fi";
import { Link } from "react-router-dom";

const UserBookings = () => {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const fetchBookings = useCallback(async () => {
    try {
      setLoading(true);
      setError("");
      const response = await api.get(
        `/bookings/user?page=${currentPage}&limit=5`
      );
      setBookings(response.data.bookings);
      setTotalPages(Math.ceil(response.data.total / 5));
    } catch (error) {
      console.error("Fehler beim Laden der Buchungen:", error);
      setError(
        "Die Buchungen konnten nicht geladen werden. Bitte versuchen Sie es später erneut."
      );
    } finally {
      setLoading(false);
    }
  }, [currentPage]);

  useEffect(() => {
    fetchBookings();
  }, [fetchBookings]);

  const cancelBooking = async (bookingId) => {
    if (
      window.confirm(
        "Sind Sie sicher, dass Sie diese Buchung stornieren möchten?"
      )
    ) {
      try {
        await api.put(`/bookings/${bookingId}/cancel`);
        // Update the booking status in the local state
        setBookings(
          bookings.map((booking) =>
            booking._id === bookingId
              ? { ...booking, status: "cancelled" }
              : booking
          )
        );
      } catch (error) {
        console.error("Fehler beim Stornieren der Buchung:", error);
        alert(
          "Die Buchung konnte nicht storniert werden. Bitte versuchen Sie es später erneut."
        );
      }
    }
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case "pending":
        return <Badge color="warning">Ausstehend</Badge>;
      case "confirmed":
        return <Badge color="success">Bestätigt</Badge>;
      case "active":
        return <Badge color="info">Aktiv</Badge>;
      case "completed":
        return <Badge color="success">Abgeschlossen</Badge>;
      case "cancelled":
        return <Badge color="failure">Storniert</Badge>;
      default:
        return <Badge>{status}</Badge>;
    }
  };

  const downloadInvoice = async (bookingId) => {
    try {
      const response = await api.get(`/bookings/${bookingId}/invoice`, {
        responseType: "blob",
      });

      // Create a blob link to download
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", `rechnung-${bookingId}.pdf`);

      // Append to html page
      document.body.appendChild(link);

      // Force download
      link.click();

      // Clean up and remove the link
      link.parentNode.removeChild(link);
    } catch (error) {
      console.error("Fehler beim Herunterladen der Rechnung:", error);
      alert(
        "Die Rechnung konnte nicht heruntergeladen werden. Bitte versuchen Sie es später erneut."
      );
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center p-8">
        <Spinner size="xl" />
      </div>
    );
  }

  if (error) {
    return <Alert color="failure">{error}</Alert>;
  }

  if (bookings.length === 0) {
    return (
      <Card>
        <div className="text-center py-8">
          <h3 className="text-lg font-medium mb-2">Keine Buchungen gefunden</h3>
          <p className="text-gray-500 mb-4">
            Sie haben noch keine Fahrzeuge gebucht.
          </p>
          <Button as={Link} to="/vehicles">
            Fahrzeuge durchsuchen
          </Button>
        </div>
      </Card>
    );
  }

  return (
    <Card>
      <h2 className="text-xl font-semibold mb-4">Meine Buchungen</h2>

      <div className="overflow-x-auto">
        <Table hoverable>
          <Table.Head>
            <Table.HeadCell>Buchungs-ID</Table.HeadCell>
            <Table.HeadCell>Fahrzeug</Table.HeadCell>
            <Table.HeadCell>Zeitraum</Table.HeadCell>
            <Table.HeadCell>Gesamtpreis</Table.HeadCell>
            <Table.HeadCell>Status</Table.HeadCell>
            <Table.HeadCell>Aktionen</Table.HeadCell>
          </Table.Head>

          <Table.Body>
            {bookings.map((booking) => (
              <Table.Row key={booking._id} className="bg-white">
                <Table.Cell className="font-medium text-gray-900">
                  #{booking._id.substring(0, 8)}
                </Table.Cell>
                <Table.Cell>
                  {booking.vehicle?.name || "Unbekanntes Fahrzeug"}
                </Table.Cell>
                <Table.Cell>
                  {new Date(booking.startDate).toLocaleDateString("de-DE")} -{" "}
                  {new Date(booking.endDate).toLocaleDateString("de-DE")}
                </Table.Cell>
                <Table.Cell>{booking.totalPrice?.toFixed(2)} €</Table.Cell>
                <Table.Cell>{getStatusBadge(booking.status)}</Table.Cell>
                <Table.Cell>
                  <div className="flex space-x-2">
                    <Button
                      size="xs"
                      color="info"
                      as={Link}
                      to={`/bookings/${booking._id}`}
                    >
                      <FiEye className="mr-1" /> Details
                    </Button>

                    {["confirmed", "completed"].includes(booking.status) && (
                      <Button
                        size="xs"
                        color="light"
                        onClick={() => downloadInvoice(booking._id)}
                      >
                        <FiDownload className="mr-1" /> Rechnung
                      </Button>
                    )}

                    {["pending", "confirmed"].includes(booking.status) && (
                      <Button
                        size="xs"
                        color="failure"
                        onClick={() => cancelBooking(booking._id)}
                      >
                        <FiX className="mr-1" /> Stornieren
                      </Button>
                    )}
                  </div>
                </Table.Cell>
              </Table.Row>
            ))}
          </Table.Body>
        </Table>
      </div>

      {totalPages > 1 && (
        <div className="flex justify-center mt-4">
          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={(page) => setCurrentPage(page)}
          />
        </div>
      )}
    </Card>
  );
};

export default UserBookings;
