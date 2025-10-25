import React, { useState, useEffect } from "react";
import { Card, Button, Badge, Table, Modal, Textarea, Spinner, Alert } from "flowbite-react";
import api from "../../services/api";
import toast from "react-hot-toast";
import { FiCheck, FiX, FiEye, FiRefreshCw } from "react-icons/fi";

const PendingBookings = () => {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedBooking, setSelectedBooking] = useState(null);
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [rejectReason, setRejectReason] = useState("");
  const [actionLoading, setActionLoading] = useState(false);

  useEffect(() => {
    fetchPendingBookings();
  }, []);

  const fetchPendingBookings = async () => {
    try {
      setLoading(true);
      const response = await api.get("/api/admin/bookings/pending");
      console.log("Pending bookings response:", response.data);

      // The API returns { success: true, data: [...] }
      // NOT { success: true, data: { data: [...] } }
      const bookingsArray = Array.isArray(response.data.data)
        ? response.data.data
        : [];

      console.log("Bookings array:", bookingsArray);
      setBookings(bookingsArray);
    } catch (error) {
      console.error("Error fetching pending bookings:", error);
      toast.error("Fehler beim Laden der ausstehenden Buchungen");
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (bookingId) => {
    try {
      setActionLoading(true);
      await api.patch(`/api/admin/bookings/${bookingId}/approve`);
      toast.success("Buchung erfolgreich genehmigt!");
      fetchPendingBookings();
    } catch (error) {
      console.error("Error approving booking:", error);
      toast.error("Fehler bei der Buchungsgenehmigung");
    } finally {
      setActionLoading(false);
    }
  };

  const handleReject = async () => {
    if (!rejectReason.trim()) {
      toast.error("Bitte geben Sie einen Ablehnungsgrund an");
      return;
    }

    try {
      setActionLoading(true);
      const response = await api.patch(`/api/admin/bookings/${selectedBooking._id}/reject`, {
        reason: rejectReason,
      });

      // Show success message with refund info if available
      const refund = response.data?.refund;
      const successMessage = refund
        ? `Buchung abgelehnt. Rückerstattung von €${refund.amount.toFixed(2)} wurde verarbeitet.`
        : "Buchung abgelehnt";

      toast.success(successMessage, { duration: 5000 });

      setShowRejectModal(false);
      setRejectReason("");
      setSelectedBooking(null);
      fetchPendingBookings();
    } catch (error) {
      console.error("Error rejecting booking:", error);
      toast.error(
        error.response?.data?.message || "Fehler bei der Buchungsablehnung"
      );
    } finally {
      setActionLoading(false);
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString("de-DE", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    });
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat("de-DE", {
      style: "currency",
      currency: "EUR",
    }).format(amount || 0);
  };

  if (loading) {
    return (
      <Card>
        <div className="flex justify-center items-center p-8">
          <Spinner size="xl" />
        </div>
      </Card>
    );
  }

  console.log("Current bookings state:", bookings);
  console.log("Bookings length:", bookings.length);

  if (bookings.length === 0) {
    return (
      <Card>
        <div className="text-center py-8">
          <h3 className="text-lg font-medium mb-2">Keine ausstehenden Buchungen</h3>
          <p className="text-gray-500">Alle Buchungen wurden bearbeitet.</p>
          <p className="text-xs text-gray-400 mt-2">Debug: Bookings array is empty</p>
        </div>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      <Card>
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold">Ausstehende Buchungen ({bookings.length})</h2>
          <Button size="sm" color="light" onClick={fetchPendingBookings}>
            <FiRefreshCw className="mr-2" /> Aktualisieren
          </Button>
        </div>

        {bookings.length > 0 && (
          <Alert color="info" className="mb-4">
            Es gibt {bookings.length} ausstehende Buchung(en) zur Genehmigung.
          </Alert>
        )}

        {/* Booking Cards */}
        <div className="space-y-4">
          {bookings.map((booking) => (
            <div key={booking._id} className="bg-white border border-gray-200 rounded-xl shadow-sm hover:shadow-md transition-shadow">
              {/* Header */}
              <div className="bg-gradient-to-r from-blue-50 to-indigo-50 px-6 py-4 border-b border-gray-200 rounded-t-xl">
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900">
                      {booking.bookingNumber || `#${booking._id.substring(0, 8)}`}
                    </h3>
                    <p className="text-sm text-gray-600 mt-1">
                      Erstellt am {formatDate(booking.createdAt)}
                    </p>
                  </div>
                  <Badge color="warning" className="text-sm">
                    Ausstehend
                  </Badge>
                </div>
              </div>

              {/* Content */}
              <div className="px-6 py-5">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  {/* Customer Info */}
                  <div className="space-y-1">
                    <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">Kunde</p>
                    <p className="text-base font-semibold text-gray-900">
                      {booking.user?.firstName} {booking.user?.lastName}
                    </p>
                    <p className="text-sm text-gray-600">{booking.user?.email}</p>
                  </div>

                  {/* Vehicle Info */}
                  <div className="space-y-1">
                    <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">Fahrzeug</p>
                    <p className="text-base font-semibold text-gray-900">{booking.vehicle?.name}</p>
                    <p className="text-sm text-gray-600">{booking.vehicle?.category}</p>
                  </div>

                  {/* Booking Details */}
                  <div className="space-y-1">
                    <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">Zeitraum</p>
                    <p className="text-base font-semibold text-gray-900">
                      {formatDate(booking.dates?.start)} - {formatDate(booking.dates?.end)}
                    </p>
                    <p className="text-sm text-gray-600">{booking.pricing?.numberOfDays} Tage</p>
                  </div>
                </div>

                {/* Amount */}
                <div className="mt-6 pt-4 border-t border-gray-100">
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium text-gray-600">Gesamtbetrag</span>
                    <span className="text-2xl font-bold text-gray-900">
                      {formatCurrency(booking.pricing?.totalAmount)}
                    </span>
                  </div>
                </div>
              </div>

              {/* Actions */}
              <div className="px-6 py-4 bg-gray-50 border-t border-gray-200 rounded-b-xl">
                <div className="flex justify-end gap-3">
                  <Button
                    size="sm"
                    color="light"
                    onClick={() => {
                      setSelectedBooking(booking);
                      setShowDetailsModal(true);
                    }}
                  >
                    <FiEye className="mr-2 h-4 w-4" />
                    Details
                  </Button>
                  <Button
                    size="sm"
                    className="bg-red-600 hover:bg-red-700 text-white"
                    onClick={() => {
                      setSelectedBooking(booking);
                      setShowRejectModal(true);
                    }}
                    disabled={actionLoading}
                  >
                    <FiX className="mr-2 h-4 w-4" />
                    Ablehnen
                  </Button>
                  <Button
                    size="sm"
                    className="bg-green-600 hover:bg-green-700 text-white"
                    onClick={() => handleApprove(booking._id)}
                    disabled={actionLoading}
                  >
                    <FiCheck className="mr-2 h-4 w-4" />
                    Genehmigen
                  </Button>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Table View (backup) */}
        <div className="overflow-x-auto hidden">
          <Table hoverable striped>
            <Table.Head>
              <Table.HeadCell>Buchungs-Nr.</Table.HeadCell>
              <Table.HeadCell>Kunde</Table.HeadCell>
              <Table.HeadCell>Fahrzeug</Table.HeadCell>
              <Table.HeadCell>Zeitraum</Table.HeadCell>
              <Table.HeadCell>Betrag</Table.HeadCell>
              <Table.HeadCell>Erstellt</Table.HeadCell>
              <Table.HeadCell>Aktionen</Table.HeadCell>
            </Table.Head>
            <Table.Body>
              {bookings.map((booking) => (
                <Table.Row key={booking._id} className="bg-white">
                  <Table.Cell className="font-medium">
                    {booking.bookingNumber || `#${booking._id.substring(0, 8)}`}
                  </Table.Cell>
                  <Table.Cell>
                    <div>
                      <div className="font-medium">
                        {booking.user?.firstName} {booking.user?.lastName}
                      </div>
                      <div className="text-sm text-gray-500">{booking.user?.email}</div>
                    </div>
                  </Table.Cell>
                  <Table.Cell>
                    <div>
                      <div className="font-medium">{booking.vehicle?.name}</div>
                      <div className="text-sm text-gray-500">{booking.vehicle?.category}</div>
                    </div>
                  </Table.Cell>
                  <Table.Cell>
                    <div className="text-sm">
                      {formatDate(booking.dates?.start)} - {formatDate(booking.dates?.end)}
                    </div>
                  </Table.Cell>
                  <Table.Cell className="font-medium">
                    {formatCurrency(booking.pricing?.totalAmount)}
                  </Table.Cell>
                  <Table.Cell>
                    <div className="text-sm text-gray-500">
                      {formatDate(booking.createdAt)}
                    </div>
                  </Table.Cell>
                  <Table.Cell>
                    <div className="flex space-x-2">
                      <Button
                        size="xs"
                        color="info"
                        onClick={() => {
                          setSelectedBooking(booking);
                          setShowDetailsModal(true);
                        }}
                      >
                        <FiEye className="mr-1" /> Details
                      </Button>
                      <Button
                        size="xs"
                        color="success"
                        onClick={() => handleApprove(booking._id)}
                        disabled={actionLoading}
                      >
                        <FiCheck className="mr-1" /> Genehmigen
                      </Button>
                      <Button
                        size="xs"
                        color="failure"
                        onClick={() => {
                          setSelectedBooking(booking);
                          setShowRejectModal(true);
                        }}
                        disabled={actionLoading}
                      >
                        <FiX className="mr-1" /> Ablehnen
                      </Button>
                    </div>
                  </Table.Cell>
                </Table.Row>
              ))}
            </Table.Body>
          </Table>
        </div>
      </Card>

      {/* Details Modal */}
      <Modal
        show={showDetailsModal}
        onClose={() => {
          setShowDetailsModal(false);
          setSelectedBooking(null);
        }}
        size="2xl"
      >
        <Modal.Header>Buchungsdetails</Modal.Header>
        <Modal.Body>
          {selectedBooking && (
            <div className="space-y-4">
              <div>
                <h3 className="font-semibold mb-2">Buchungsinformationen</h3>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-gray-500">Buchungs-Nr.:</span>
                    <p className="font-medium">
                      {selectedBooking.bookingNumber || `#${selectedBooking._id.substring(0, 8)}`}
                    </p>
                  </div>
                  <div>
                    <span className="text-gray-500">Status:</span>
                    <p>
                      <Badge color="warning">Wartend</Badge>
                    </p>
                  </div>
                  <div>
                    <span className="text-gray-500">Von:</span>
                    <p className="font-medium">{formatDate(selectedBooking.dates?.start)}</p>
                  </div>
                  <div>
                    <span className="text-gray-500">Bis:</span>
                    <p className="font-medium">{formatDate(selectedBooking.dates?.end)}</p>
                  </div>
                </div>
              </div>

              <div>
                <h3 className="font-semibold mb-2">Kunde</h3>
                <div className="text-sm space-y-1">
                  <p>
                    <span className="text-gray-500">Name:</span>{" "}
                    {selectedBooking.user?.firstName} {selectedBooking.user?.lastName}
                  </p>
                  <p>
                    <span className="text-gray-500">E-Mail:</span> {selectedBooking.user?.email}
                  </p>
                  <p>
                    <span className="text-gray-500">Telefon:</span>{" "}
                    {selectedBooking.user?.profile?.phone || "Nicht angegeben"}
                  </p>
                </div>
              </div>

              <div>
                <h3 className="font-semibold mb-2">Fahrzeug</h3>
                <div className="text-sm space-y-1">
                  <p>
                    <span className="text-gray-500">Name:</span> {selectedBooking.vehicle?.name}
                  </p>
                  <p>
                    <span className="text-gray-500">Kategorie:</span>{" "}
                    {selectedBooking.vehicle?.category}
                  </p>
                </div>
              </div>

              <div>
                <h3 className="font-semibold mb-2">Preisdetails</h3>
                <div className="text-sm space-y-1">
                  <p>
                    <span className="text-gray-500">Anzahl Tage:</span>{" "}
                    {selectedBooking.pricing?.numberOfDays || 0}
                  </p>
                  <p>
                    <span className="text-gray-500">Versicherung:</span>{" "}
                    {selectedBooking.pricing?.insurance?.type || "Standard"}
                  </p>
                  <p className="font-semibold text-lg mt-2">
                    <span className="text-gray-500">Gesamtbetrag:</span>{" "}
                    {formatCurrency(selectedBooking.pricing?.totalAmount)}
                  </p>
                </div>
              </div>
            </div>
          )}
        </Modal.Body>
        <Modal.Footer>
          <Button
            color="success"
            onClick={() => {
              handleApprove(selectedBooking._id);
              setShowDetailsModal(false);
            }}
            disabled={actionLoading}
          >
            <FiCheck className="mr-2" /> Genehmigen
          </Button>
          <Button
            color="failure"
            onClick={() => {
              setShowDetailsModal(false);
              setShowRejectModal(true);
            }}
            disabled={actionLoading}
          >
            <FiX className="mr-2" /> Ablehnen
          </Button>
          <Button
            color="gray"
            onClick={() => {
              setShowDetailsModal(false);
              setSelectedBooking(null);
            }}
          >
            Schließen
          </Button>
        </Modal.Footer>
      </Modal>

      {/* Reject Modal */}
      <Modal
        show={showRejectModal}
        onClose={() => {
          setShowRejectModal(false);
          setRejectReason("");
          setSelectedBooking(null);
        }}
      >
        <Modal.Header>Buchung ablehnen</Modal.Header>
        <Modal.Body>
          <div className="space-y-4">
            <p>
              Möchten Sie die Buchung{" "}
              <strong>
                {selectedBooking?.bookingNumber || `#${selectedBooking?._id.substring(0, 8)}`}
              </strong>{" "}
              wirklich ablehnen?
            </p>
            <div>
              <label className="block mb-2 text-sm font-medium text-gray-900">
                Grund für Ablehnung *
              </label>
              <Textarea
                rows={4}
                value={rejectReason}
                onChange={(e) => setRejectReason(e.target.value)}
                placeholder="Bitte geben Sie einen Grund für die Ablehnung an..."
                required
              />
            </div>
          </div>
        </Modal.Body>
        <Modal.Footer className="flex justify-end gap-3">
          <Button
            color="gray"
            onClick={() => {
              setShowRejectModal(false);
              setRejectReason("");
              setSelectedBooking(null);
            }}
            disabled={actionLoading}
          >
            Abbrechen
          </Button>
          <Button
            color="failure"
            onClick={handleReject}
            disabled={actionLoading || !rejectReason.trim()}
            className="bg-red-600 hover:bg-red-700"
          >
            {actionLoading ? (
              <>
                <Spinner size="sm" className="mr-2" />
                Wird abgelehnt...
              </>
            ) : (
              <>
                <FiX className="mr-2" />
                Buchung ablehnen
              </>
            )}
          </Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
};

export default PendingBookings;
