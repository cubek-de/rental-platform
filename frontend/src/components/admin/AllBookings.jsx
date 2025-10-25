import React, { useState, useEffect } from "react";
import { Card, Badge, Button, Spinner, TextInput, Select, Modal } from "flowbite-react";
import api from "../../services/api";
import toast from "react-hot-toast";
import { FiRefreshCw, FiSearch, FiEye, FiArchive, FiCalendar } from "react-icons/fi";

const AllBookings = () => {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [sortBy, setSortBy] = useState("createdAt");
  const [sortOrder, setSortOrder] = useState("desc");
  const [showArchiveModal, setShowArchiveModal] = useState(false);
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth());
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [isArchiveMode, setIsArchiveMode] = useState(false);

  useEffect(() => {
    fetchAllBookings();
  }, []);

  const fetchAllBookings = async () => {
    try {
      setLoading(true);
      const response = await api.get("/api/admin/bookings");
      console.log("All bookings response:", response.data);
      console.log("Bookings data structure:", response.data.data);

      // Handle both possible response structures
      let bookingsArray = [];
      if (response.data.data.bookings) {
        bookingsArray = response.data.data.bookings;
      } else if (Array.isArray(response.data.data)) {
        bookingsArray = response.data.data;
      }

      console.log("Extracted bookings array:", bookingsArray);
      console.log("First booking sample:", bookingsArray[0]);

      setBookings(bookingsArray);
    } catch (error) {
      console.error("Error fetching all bookings:", error);
      toast.error("Fehler beim Laden der Buchungen");
    } finally {
      setLoading(false);
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

  const getMonthName = (monthIndex) => {
    const months = [
      "Januar", "Februar", "März", "April", "Mai", "Juni",
      "Juli", "August", "September", "Oktober", "November", "Dezember"
    ];
    return months[monthIndex];
  };

  const handleArchiveSelect = () => {
    setIsArchiveMode(true);
    setShowArchiveModal(false);
    toast.success(`Buchungen für ${getMonthName(selectedMonth)} ${selectedYear} werden angezeigt`);
  };

  const handleBackToCurrent = () => {
    setIsArchiveMode(false);
    setSelectedMonth(new Date().getMonth());
    setSelectedYear(new Date().getFullYear());
    toast.success("Zurück zu aktuellen Buchungen");
  };

  const isBookingInSelectedMonth = (booking) => {
    const bookingDate = new Date(booking.createdAt);
    return bookingDate.getMonth() === selectedMonth && bookingDate.getFullYear() === selectedYear;
  };

  const getStatusBadge = (status) => {
    const statusConfig = {
      pending: { color: "warning", text: "Ausstehend" },
      confirmed: { color: "success", text: "Bestätigt" },
      active: { color: "info", text: "Aktiv" },
      completed: { color: "dark", text: "Abgeschlossen" },
      cancelled: { color: "failure", text: "Storniert" },
    };

    const config = statusConfig[status] || { color: "gray", text: status };

    return (
      <Badge color={config.color} className="inline-flex">
        {config.text}
      </Badge>
    );
  };

  const getPaymentStatusBadge = (status) => {
    const statusConfig = {
      pending: { color: "warning", text: "Ausstehend" },
      completed: { color: "success", text: "Bezahlt" },
      partially_paid: { color: "info", text: "Teilweise bezahlt" },
      refunded: { color: "purple", text: "Rückerstattet" },
      failed: { color: "failure", text: "Fehlgeschlagen" },
    };

    const config = statusConfig[status] || { color: "gray", text: status };

    return <Badge color={config.color}>{config.text}</Badge>;
  };

  // Filter and sort bookings
  const filteredBookings = bookings
    .filter((booking) => {
      // Month/Year filter - filter by selected month
      if (!isBookingInSelectedMonth(booking)) {
        return false;
      }

      // Status filter
      if (statusFilter !== "all" && booking.status !== statusFilter) {
        return false;
      }

      // Search filter
      if (searchTerm) {
        const searchLower = searchTerm.toLowerCase();
        return (
          booking.bookingNumber?.toLowerCase().includes(searchLower) ||
          booking.user?.firstName?.toLowerCase().includes(searchLower) ||
          booking.user?.lastName?.toLowerCase().includes(searchLower) ||
          booking.user?.email?.toLowerCase().includes(searchLower) ||
          booking.vehicle?.name?.toLowerCase().includes(searchLower)
        );
      }

      return true;
    })
    .sort((a, b) => {
      let aValue, bValue;

      switch (sortBy) {
        case "createdAt":
          aValue = new Date(a.createdAt);
          bValue = new Date(b.createdAt);
          break;
        case "startDate":
          aValue = new Date(a.dates?.start);
          bValue = new Date(b.dates?.start);
          break;
        case "totalAmount":
          aValue = a.pricing?.totalAmount || 0;
          bValue = b.pricing?.totalAmount || 0;
          break;
        default:
          return 0;
      }

      if (sortOrder === "asc") {
        return aValue > bValue ? 1 : -1;
      } else {
        return aValue < bValue ? 1 : -1;
      }
    });

  if (loading) {
    return (
      <Card>
        <div className="flex justify-center items-center p-8">
          <Spinner size="xl" />
        </div>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      <Card>
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">
              {isArchiveMode ? "Archiv - Buchungen" : "Alle Buchungen"}
            </h2>
            <p className="text-sm text-gray-600 mt-1">
              {isArchiveMode ? (
                <span className="flex items-center gap-2">
                  <FiCalendar className="inline" />
                  {getMonthName(selectedMonth)} {selectedYear} - {filteredBookings.length} Buchungen
                </span>
              ) : (
                <span className="flex items-center gap-2">
                  <FiCalendar className="inline" />
                  {getMonthName(selectedMonth)} {selectedYear} (Aktueller Monat) - {filteredBookings.length} Buchungen
                </span>
              )}
            </p>
          </div>
          <div className="flex gap-2">
            {isArchiveMode && (
              <Button size="sm" color="gray" onClick={handleBackToCurrent}>
                <FiRefreshCw className="mr-2" /> Aktueller Monat
              </Button>
            )}
            <Button size="sm" color="light" onClick={() => setShowArchiveModal(true)}>
              <FiArchive className="mr-2" /> Archiv
            </Button>
          </div>
        </div>

        {/* Filters */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          {/* Search */}
          <TextInput
            icon={FiSearch}
            placeholder="Suche nach Buchungsnr., Kunde, Fahrzeug..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />

          {/* Status Filter */}
          <Select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
          >
            <option value="all">Alle Status</option>
            <option value="pending">Ausstehend</option>
            <option value="confirmed">Bestätigt</option>
            <option value="active">Aktiv</option>
            <option value="completed">Abgeschlossen</option>
            <option value="cancelled">Storniert</option>
          </Select>

          {/* Sort */}
          <div className="flex gap-2">
            <Select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="flex-1"
            >
              <option value="createdAt">Erstellt am</option>
              <option value="startDate">Startdatum</option>
              <option value="totalAmount">Betrag</option>
            </Select>
            <Button
              size="sm"
              color="light"
              onClick={() => setSortOrder(sortOrder === "asc" ? "desc" : "asc")}
            >
              {sortOrder === "asc" ? "↑" : "↓"}
            </Button>
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto bg-white rounded-lg shadow">
          {filteredBookings.length > 0 ? (
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">Buchungs-Nr.</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">Kunde</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">Fahrzeug</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">Zeitraum</th>
                  <th className="px-6 py-3 text-center text-xs font-medium text-gray-700 uppercase tracking-wider">Tage</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">Betrag</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">Zahlung</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">Status</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">Erstellt</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">Aktionen</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredBookings.map((booking) => (
                  <tr key={booking._id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {booking.bookingNumber || `#${booking._id?.substring(0, 8)}`}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">
                        {booking.user?.firstName} {booking.user?.lastName}
                      </div>
                      <div className="text-sm text-gray-500">{booking.user?.email}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">
                        {booking.vehicle?.name}
                      </div>
                      <div className="text-sm text-gray-500">
                        {booking.vehicle?.category}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{formatDate(booking.dates?.start)}</div>
                      <div className="text-sm text-gray-500">
                        bis {formatDate(booking.dates?.end)}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-center text-sm text-gray-900">
                      {booking.pricing?.numberOfDays || 0}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold text-gray-900">
                      {formatCurrency(booking.pricing?.totalAmount)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {getPaymentStatusBadge(booking.payment?.status)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {getStatusBadge(booking.status)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {formatDate(booking.createdAt)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      <Button
                        size="xs"
                        color="light"
                        onClick={() => {
                          toast("Details-Ansicht kommt bald");
                        }}
                      >
                        <FiEye className="mr-1" /> Details
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <div className="text-center py-12">
              <p className="text-gray-600">
                {searchTerm || statusFilter !== "all"
                  ? "Keine Buchungen gefunden, die Ihren Suchkriterien entsprechen."
                  : "Noch keine Buchungen vorhanden."}
              </p>
            </div>
          )}
        </div>

        {/* Summary Stats */}
        {filteredBookings.length > 0 && (
          <div className="mt-6 pt-6 border-t border-gray-200">
            <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-gray-900">
                  {bookings.filter((b) => b.status === "pending").length}
                </div>
                <div className="text-sm text-gray-600">Ausstehend</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-green-600">
                  {bookings.filter((b) => b.status === "confirmed").length}
                </div>
                <div className="text-sm text-gray-600">Bestätigt</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-600">
                  {bookings.filter((b) => b.status === "active").length}
                </div>
                <div className="text-sm text-gray-600">Aktiv</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-gray-600">
                  {bookings.filter((b) => b.status === "completed").length}
                </div>
                <div className="text-sm text-gray-600">Abgeschlossen</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-red-600">
                  {bookings.filter((b) => b.status === "cancelled").length}
                </div>
                <div className="text-sm text-gray-600">Storniert</div>
              </div>
            </div>
          </div>
        )}
      </Card>

      {/* Archive Modal */}
      <Modal show={showArchiveModal} onClose={() => setShowArchiveModal(false)} size="md">
        <Modal.Header>Archiv durchsuchen</Modal.Header>
        <Modal.Body>
          <div className="space-y-4">
            <p className="text-sm text-gray-600">
              Wählen Sie einen Monat und ein Jahr aus, um ältere Buchungen anzuzeigen.
            </p>

            <div className="grid grid-cols-2 gap-4">
              {/* Month Selector */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Monat
                </label>
                <Select
                  value={selectedMonth}
                  onChange={(e) => setSelectedMonth(parseInt(e.target.value))}
                >
                  {Array.from({ length: 12 }, (_, i) => (
                    <option key={i} value={i}>
                      {getMonthName(i)}
                    </option>
                  ))}
                </Select>
              </div>

              {/* Year Selector */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Jahr
                </label>
                <Select
                  value={selectedYear}
                  onChange={(e) => setSelectedYear(parseInt(e.target.value))}
                >
                  {Array.from({ length: 5 }, (_, i) => {
                    const year = new Date().getFullYear() - i;
                    return (
                      <option key={year} value={year}>
                        {year}
                      </option>
                    );
                  })}
                </Select>
              </div>
            </div>

            {/* Preview */}
            <div className="mt-4 p-4 bg-blue-50 rounded-lg border border-blue-200">
              <p className="text-sm font-medium text-blue-900">
                Vorschau: {getMonthName(selectedMonth)} {selectedYear}
              </p>
              <p className="text-xs text-blue-700 mt-1">
                Buchungen für diesen Monat werden angezeigt
              </p>
            </div>
          </div>
        </Modal.Body>
        <Modal.Footer className="flex justify-end gap-3">
          <Button color="gray" onClick={() => setShowArchiveModal(false)}>
            Abbrechen
          </Button>
          <Button
            onClick={handleArchiveSelect}
            className="bg-gradient-to-r from-blue-600 to-blue-700 text-white hover:from-blue-700 hover:to-blue-800"
          >
            <FiArchive className="mr-2" />
            Buchungen anzeigen
          </Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
};

export default AllBookings;
