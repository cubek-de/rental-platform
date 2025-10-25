import React, { useState, useEffect, useRef } from 'react';
import { Badge, Button, Card, Spinner } from 'flowbite-react';
import toast from 'react-hot-toast';
import { formatDistanceToNow } from 'date-fns';
import { de } from 'date-fns/locale';

const PendingVehicles = () => {
  const [pendingVehicles, setpendingVehicles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedVehicle, setSelectedVehicle] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [modalAction, setModalAction] = useState(null); // 'approve' or 'reject'
  const [notes, setNotes] = useState('');
  const [processing, setProcessing] = useState(false);
  const hasLoadedVehicles = useRef(false);

  useEffect(() => {
    if (!hasLoadedVehicles.current) {
      hasLoadedVehicles.current = true;
      fetchPendingVehicles();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const fetchPendingVehicles = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(
        `${import.meta.env.VITE_API_URL || 'http://localhost:5005'}/api/admin/vehicles/pending`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const data = await response.json();
      if (data.success) {
        setpendingVehicles(data.data.vehicles);
      } else {
        toast.error('Fehler beim Laden der ausstehenden Fahrzeuge');
      }
    } catch (error) {
      console.error('Error fetching pending vehicles:', error);
      toast.error('Fehler beim Laden der ausstehenden Fahrzeuge');
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = (vehicle) => {
    setSelectedVehicle(vehicle);
    setModalAction('approve');
    setNotes('');
    setShowModal(true);
  };

  const handleReject = (vehicle) => {
    setSelectedVehicle(vehicle);
    setModalAction('reject');
    setNotes('');
    setShowModal(true);
  };

  const handleSubmitDecision = async () => {
    if (!selectedVehicle) return;

    if (modalAction === 'reject' && !notes.trim()) {
      toast.error('Bitte geben Sie einen Ablehnungsgrund an');
      return;
    }

    setProcessing(true);

    try {
      const token = localStorage.getItem('token');
      const response = await fetch(
        `${import.meta.env.VITE_API_URL || 'http://localhost:5005'}/api/admin/vehicles/${selectedVehicle._id}/verify`,
        {
          method: 'PATCH',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            status: modalAction === 'approve' ? 'genehmigt' : 'abgelehnt',
            notes: notes.trim(),
          }),
        }
      );

      const data = await response.json();

      if (data.success) {
        toast.success(
          modalAction === 'approve'
            ? 'Fahrzeug erfolgreich genehmigt'
            : 'Fahrzeug erfolgreich abgelehnt'
        );

        // Remove the vehicle from the pending list
        setpendingVehicles((prev) =>
          prev.filter((v) => v._id !== selectedVehicle._id)
        );

        // Emit custom event to notify parent to refresh stats
        window.dispatchEvent(new CustomEvent('vehicleStatusChanged'));

        setShowModal(false);
        setSelectedVehicle(null);
        setNotes('');
      } else {
        toast.error(data.message || 'Fehler bei der Verarbeitung');
      }
    } catch (error) {
      console.error('Error processing vehicle:', error);
      toast.error('Fehler bei der Verarbeitung');
    } finally {
      setProcessing(false);
    }
  };

  const getCategoryBadge = (category) => {
    const colors = {
      Wohnmobil: 'blue',
      Wohnwagen: 'green',
      Kastenwagen: 'purple',
    };
    return <Badge color={colors[category] || 'gray'}>{category}</Badge>;
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <Spinner size="xl" />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-gray-900">
          Ausstehende Fahrzeuge ({pendingVehicles.length})
        </h2>
        <Button color="gray" size="sm" onClick={fetchPendingVehicles}>
          <svg
            className="w-4 h-4 mr-2"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
            />
          </svg>
          Aktualisieren
        </Button>
      </div>

      {pendingVehicles.length === 0 ? (
        <div className="text-center py-12 bg-gray-50 rounded-lg">
          <svg
            className="mx-auto h-12 w-12 text-gray-400"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
          <h3 className="mt-2 text-sm font-medium text-gray-900">
            Keine ausstehenden Fahrzeuge
          </h3>
          <p className="mt-1 text-sm text-gray-500">
            Alle Fahrzeuge wurden überprüft.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-6">
          {pendingVehicles.map((vehicle) => (
            <div key={vehicle._id} className="bg-white rounded-2xl shadow-xl overflow-hidden border border-gray-200 hover:shadow-2xl transition-shadow duration-300">
              <div className="flex flex-col lg:flex-row">
                {/* Vehicle Image with Overlay */}
                <div className="lg:w-2/5 relative group">
                  <div className="absolute top-4 right-4 z-10">
                    {getCategoryBadge(vehicle.category)}
                  </div>
                  <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/60 to-transparent p-4">
                    <div className="flex items-center space-x-2 text-white">
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      <span className="text-sm font-medium">
                        {formatDistanceToNow(new Date(vehicle.createdAt), { addSuffix: true, locale: de })}
                      </span>
                    </div>
                  </div>
                  <img
                    src={
                      vehicle.images?.find((img) => img.isMain)?.url ||
                      vehicle.images?.[0]?.url ||
                      'https://via.placeholder.com/400x300?text=Kein+Bild'
                    }
                    alt={vehicle.name}
                    className="w-full h-80 object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                </div>

                {/* Vehicle Details */}
                <div className="lg:w-3/5 p-6 space-y-5">
                  {/* Header */}
                  <div>
                    <h3 className="text-2xl font-bold text-gray-900 mb-2 bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text">
                      {vehicle.name}
                    </h3>
                    <div className="flex items-center space-x-2 text-sm">
                      <div className="flex items-center px-3 py-1.5 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg border border-blue-200">
                        <svg className="w-4 h-4 text-blue-600 mr-1.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                        </svg>
                        <span className="font-medium text-blue-900">
                          {vehicle.owner?.firstName} {vehicle.owner?.lastName}
                        </span>
                      </div>
                      {vehicle.owner?.agentProfile?.companyName && (
                        <div className="flex items-center px-3 py-1.5 bg-gradient-to-r from-purple-50 to-pink-50 rounded-lg border border-purple-200">
                          <svg className="w-4 h-4 text-purple-600 mr-1.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                          </svg>
                          <span className="font-medium text-purple-900">{vehicle.owner.agentProfile.companyName}</span>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Specs Grid */}
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                    <div className="bg-gradient-to-br from-gray-50 to-gray-100 p-3 rounded-xl border border-gray-200">
                      <p className="text-xs text-gray-500 mb-1 font-medium uppercase tracking-wide">Marke</p>
                      <p className="text-sm font-bold text-gray-900">{vehicle.technicalData?.brand || 'N/A'}</p>
                    </div>
                    <div className="bg-gradient-to-br from-gray-50 to-gray-100 p-3 rounded-xl border border-gray-200">
                      <p className="text-xs text-gray-500 mb-1 font-medium uppercase tracking-wide">Modell</p>
                      <p className="text-sm font-bold text-gray-900">{vehicle.technicalData?.model || 'N/A'}</p>
                    </div>
                    <div className="bg-gradient-to-br from-gray-50 to-gray-100 p-3 rounded-xl border border-gray-200">
                      <p className="text-xs text-gray-500 mb-1 font-medium uppercase tracking-wide">Jahr</p>
                      <p className="text-sm font-bold text-gray-900">{vehicle.technicalData?.year || 'N/A'}</p>
                    </div>
                    <div className="bg-gradient-to-br from-emerald-50 to-teal-50 p-3 rounded-xl border border-emerald-200">
                      <p className="text-xs text-emerald-600 mb-1 font-medium uppercase tracking-wide">Preis/Tag</p>
                      <p className="text-sm font-bold text-emerald-700">€{vehicle.pricing?.basePrice?.perDay || 'N/A'}</p>
                    </div>
                  </div>

                  {/* Features */}
                  <div className="flex flex-wrap gap-2">
                    <div className="inline-flex items-center px-3 py-2 bg-gradient-to-r from-blue-50 to-cyan-50 rounded-lg border border-blue-200">
                      <svg className="w-4 h-4 text-blue-600 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                      </svg>
                      <span className="text-sm font-semibold text-blue-900">{vehicle.capacity?.seats || 0} Sitzplätze</span>
                    </div>
                    <div className="inline-flex items-center px-3 py-2 bg-gradient-to-r from-purple-50 to-pink-50 rounded-lg border border-purple-200">
                      <svg className="w-4 h-4 text-purple-600 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                      </svg>
                      <span className="text-sm font-semibold text-purple-900">{vehicle.capacity?.sleepingPlaces || 0} Schlafplätze</span>
                    </div>
                    {vehicle.location?.address?.city && (
                      <div className="inline-flex items-center px-3 py-2 bg-gradient-to-r from-orange-50 to-red-50 rounded-lg border border-orange-200">
                        <svg className="w-4 h-4 text-orange-600 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                        </svg>
                        <span className="text-sm font-semibold text-orange-900">{vehicle.location.address.city}</span>
                      </div>
                    )}
                  </div>

                  {/* Description */}
                  {vehicle.description?.short && (
                    <div className="bg-gradient-to-r from-gray-50 to-gray-100 p-4 rounded-xl border border-gray-200">
                      <p className="text-sm text-gray-700 leading-relaxed italic">
                        "{vehicle.description.short}"
                      </p>
                    </div>
                  )}

                  <div className="flex gap-3 pt-4 border-t border-gray-200">
                    <button
                      onClick={() => handleApprove(vehicle)}
                      className="flex-1 inline-flex items-center justify-center px-6 py-3 bg-gradient-to-r from-emerald-500 to-teal-600 text-white font-semibold rounded-lg shadow-md hover:from-emerald-600 hover:to-teal-700 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:ring-offset-2 transform transition-all duration-200 hover:scale-105"
                    >
                      <svg
                        className="w-5 h-5 mr-2"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M5 13l4 4L19 7"
                        />
                      </svg>
                      Genehmigen
                    </button>
                    <button
                      onClick={() => handleReject(vehicle)}
                      className="flex-1 inline-flex items-center justify-center px-6 py-3 bg-gradient-to-r from-red-500 to-pink-600 text-white font-semibold rounded-lg shadow-md hover:from-red-600 hover:to-pink-700 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 transform transition-all duration-200 hover:scale-105"
                    >
                      <svg
                        className="w-5 h-5 mr-2"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M6 18L18 6M6 6l12 12"
                        />
                      </svg>
                      Ablehnen
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Approval/Rejection Modal - Custom Design */}
      {showModal && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="flex items-center justify-center min-h-screen px-4 pt-4 pb-20 text-center sm:block sm:p-0">
            {/* Background overlay */}
            <div
              className="fixed inset-0 transition-opacity bg-gray-500 bg-opacity-75"
              onClick={() => !processing && setShowModal(false)}
            ></div>

            {/* Modal panel */}
            <div className="inline-block align-bottom bg-white rounded-2xl text-left overflow-hidden shadow-2xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full">
              {/* Header with gradient */}
              <div className={`px-6 py-5 ${modalAction === 'approve' ? 'bg-gradient-to-r from-emerald-500 to-teal-600' : 'bg-gradient-to-r from-red-500 to-pink-600'}`}>
                <div className="flex items-center">
                  <div className={`flex-shrink-0 flex items-center justify-center h-12 w-12 rounded-xl ${modalAction === 'approve' ? 'bg-emerald-100' : 'bg-red-100'} sm:h-12 sm:w-12`}>
                    {modalAction === 'approve' ? (
                      <svg className="h-6 w-6 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                    ) : (
                      <svg className="h-6 w-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                      </svg>
                    )}
                  </div>
                  <div className="ml-4">
                    <h3 className="text-xl font-bold text-white">
                      {modalAction === 'approve' ? 'Fahrzeug genehmigen' : 'Fahrzeug ablehnen'}
                    </h3>
                  </div>
                </div>
              </div>

              {/* Body */}
              <div className="px-6 py-5">
                {selectedVehicle && (
                  <div className="space-y-4">
                    {/* Vehicle info card */}
                    <div className="bg-gradient-to-br from-gray-50 to-gray-100 rounded-xl p-4 border border-gray-200">
                      <div className="flex items-center space-x-3">
                        {selectedVehicle.images?.[0]?.url && (
                          <img
                            src={selectedVehicle.images[0].url}
                            alt={selectedVehicle.name}
                            className="w-16 h-16 object-cover rounded-lg"
                          />
                        )}
                        <div>
                          <h4 className="font-bold text-gray-900">{selectedVehicle.name}</h4>
                          <p className="text-sm text-gray-600">
                            {selectedVehicle.technicalData?.brand} {selectedVehicle.technicalData?.model}
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* Message */}
                    <p className="text-gray-700 text-base leading-relaxed">
                      {modalAction === 'approve' ? (
                        <>
                          Möchten Sie das Fahrzeug <strong className="text-emerald-600">{selectedVehicle.name}</strong> genehmigen?
                          <span className="block mt-2 text-sm text-gray-600">
                            ✓ Das Fahrzeug wird für Buchungen verfügbar sein<br/>
                            ✓ Der Vermieter wird benachrichtigt
                          </span>
                        </>
                      ) : (
                        <>
                          Möchten Sie das Fahrzeug <strong className="text-red-600">{selectedVehicle.name}</strong> ablehnen?
                          <span className="block mt-2 text-sm text-gray-600">
                            ⚠ Das Fahrzeug wird aus der Datenbank gelöscht<br/>
                            ⚠ Der Vermieter wird benachrichtigt
                          </span>
                        </>
                      )}
                    </p>

                    {/* Notes/Reason input */}
                    <div>
                      <label
                        htmlFor="notes"
                        className="block text-sm font-semibold text-gray-700 mb-2"
                      >
                        {modalAction === 'approve' ? (
                          <span className="flex items-center">
                            <svg className="w-4 h-4 mr-1 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 8h10M7 12h4m1 8l-4-4H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-3l-4 4z" />
                            </svg>
                            Anmerkungen (optional)
                          </span>
                        ) : (
                          <span className="flex items-center text-red-600">
                            <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                            </svg>
                            Ablehnungsgrund (erforderlich) *
                          </span>
                        )}
                      </label>
                      <textarea
                        id="notes"
                        value={notes}
                        onChange={(e) => setNotes(e.target.value)}
                        rows={4}
                        className="w-full px-4 py-3 text-gray-900 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all duration-200 resize-none"
                        placeholder={
                          modalAction === 'approve'
                            ? 'z.B. Alle Dokumente vollständig, Fahrzeug entspricht den Standards...'
                            : 'z.B. Fehlende Dokumente, unzureichende Fahrzeugbeschreibung...'
                        }
                        required={modalAction === 'reject'}
                      />
                      {modalAction === 'reject' && !notes.trim() && (
                        <p className="mt-1 text-xs text-red-600">
                          Bitte geben Sie einen Ablehnungsgrund an
                        </p>
                      )}
                    </div>
                  </div>
                )}
              </div>

              {/* Footer with actions */}
              <div className="px-6 py-4 bg-gray-50 flex gap-3">
                <button
                  onClick={() => setShowModal(false)}
                  disabled={processing}
                  className="flex-1 px-4 py-2.5 bg-white text-gray-700 font-medium rounded-lg border border-gray-300 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
                >
                  Abbrechen
                </button>
                <button
                  onClick={handleSubmitDecision}
                  disabled={processing}
                  className={`flex-1 inline-flex items-center justify-center px-4 py-2.5 font-semibold text-white rounded-lg shadow-md focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 ${
                    modalAction === 'approve'
                      ? 'bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 focus:ring-emerald-500'
                      : 'bg-gradient-to-r from-red-500 to-pink-600 hover:from-red-600 hover:to-pink-700 focus:ring-red-500'
                  }`}
                >
                  {processing ? (
                    <>
                      <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Verarbeitung...
                    </>
                  ) : (
                    <>
                      {modalAction === 'approve' ? (
                        <>
                          <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                          </svg>
                          Jetzt genehmigen
                        </>
                      ) : (
                        <>
                          <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                          </svg>
                          Jetzt ablehnen
                        </>
                      )}
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PendingVehicles;
