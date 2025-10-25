import React, { useState, useEffect } from 'react';
import { Badge, Button, Card, Spinner, Modal } from 'flowbite-react';
import toast from 'react-hot-toast';
import { formatDistanceToNow } from 'date-fns';
import { de } from 'date-fns/locale';
import { FiPlus, FiEdit, FiTrash, FiEye, FiClock, FiCheckCircle, FiXCircle } from 'react-icons/fi';
import api from '../../services/api';

const AgentVehiclesSection = () => {
  const [vehicles, setVehicles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);

  useEffect(() => {
    fetchVehicles();
  }, []);

  const fetchVehicles = async () => {
    try {
      setLoading(true);
      const response = await api.get('/api/agent/vehicles');

      if (response.data.success) {
        const allVehicles = response.data.data.vehicles || response.data.data || [];
        // Filter to show ONLY approved vehicles in this section
        const approvedVehicles = allVehicles.filter(
          (v) => v.verificationStatus === 'genehmigt'
        );
        setVehicles(approvedVehicles);
      }
    } catch (error) {
      console.error('Error fetching vehicles:', error);
      toast.error('Fehler beim Laden der Fahrzeuge');
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'genehmigt':
        return (
          <Badge color="success" className="flex items-center gap-1">
            <FiCheckCircle className="w-3 h-3" />
            Genehmigt
          </Badge>
        );
      case 'ausstehend':
        return (
          <Badge color="warning" className="flex items-center gap-1">
            <FiClock className="w-3 h-3" />
            Ausstehend
          </Badge>
        );
      case 'abgelehnt':
        return (
          <Badge color="failure" className="flex items-center gap-1">
            <FiXCircle className="w-3 h-3" />
            Abgelehnt
          </Badge>
        );
      default:
        return <Badge color="gray">{status}</Badge>;
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

  const handleDeleteVehicle = async (vehicleId) => {
    if (!confirm('Möchten Sie dieses Fahrzeug wirklich löschen?')) {
      return;
    }

    try {
      await api.delete(`/api/vehicles/${vehicleId}`);
      toast.success('Fahrzeug erfolgreich gelöscht');
      fetchVehicles();
    } catch (error) {
      console.error('Error deleting vehicle:', error);
      toast.error('Fehler beim Löschen des Fahrzeugs');
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <Spinner size="xl" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold text-gray-900">Meine Fahrzeuge</h2>
          <p className="text-gray-600 mt-1">
            Hier werden nur Ihre genehmigten und buchbaren Fahrzeuge angezeigt
          </p>
        </div>
      </div>

      {/* Vehicles List */}
      {vehicles.length === 0 ? (
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
              d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
            />
          </svg>
          <h3 className="mt-2 text-sm font-medium text-gray-900">
            Noch keine Fahrzeuge
          </h3>
          <p className="mt-1 text-sm text-gray-500">
            Fügen Sie Ihr erstes Fahrzeug hinzu, um zu beginnen.
          </p>
          <div className="mt-6">
            <Button onClick={() => setShowCreateModal(true)} color="blue">
              <FiPlus className="mr-2 h-5 w-5" />
              Fahrzeug hinzufügen
            </Button>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-6">
          {vehicles.map((vehicle) => (
            <Card key={vehicle._id}>
              <div className="flex flex-col lg:flex-row gap-6">
                {/* Vehicle Image */}
                <div className="lg:w-1/3">
                  <img
                    src={
                      vehicle.images?.find((img) => img.isMain)?.url ||
                      vehicle.images?.[0]?.url ||
                      'https://via.placeholder.com/400x300?text=Kein+Bild'
                    }
                    alt={vehicle.name}
                    className="w-full h-48 object-cover rounded-lg"
                  />
                </div>

                {/* Vehicle Details */}
                <div className="lg:w-2/3 space-y-4">
                  <div className="flex items-start justify-between">
                    <div>
                      <h3 className="text-xl font-bold text-gray-900">
                        {vehicle.name}
                      </h3>
                      <p className="text-sm text-gray-500 mt-1">
                        Erstellt{' '}
                        {formatDistanceToNow(new Date(vehicle.createdAt), {
                          addSuffix: true,
                          locale: de,
                        })}
                      </p>
                    </div>
                    <div className="flex gap-2">
                      {getCategoryBadge(vehicle.category)}
                      {getStatusBadge(vehicle.verificationStatus)}
                    </div>
                  </div>

                  {/* Status Messages */}
                  {vehicle.verificationStatus === 'ausstehend' && (
                    <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
                      <div className="flex">
                        <FiClock className="w-5 h-5 text-yellow-600 mr-2 flex-shrink-0 mt-0.5" />
                        <div>
                          <p className="text-sm font-medium text-yellow-800">
                            Genehmigung ausstehend
                          </p>
                          <p className="text-sm text-yellow-700 mt-1">
                            Ihr Fahrzeug wird derzeit von unserem Team überprüft. Sie
                            werden benachrichtigt, sobald es genehmigt wurde.
                          </p>
                        </div>
                      </div>
                    </div>
                  )}

                  {vehicle.verificationStatus === 'genehmigt' && (
                    <div className="bg-green-50 border border-green-200 rounded-lg p-3">
                      <div className="flex">
                        <FiCheckCircle className="w-5 h-5 text-green-600 mr-2 flex-shrink-0 mt-0.5" />
                        <div>
                          <p className="text-sm font-medium text-green-800">
                            Fahrzeug genehmigt
                          </p>
                          <p className="text-sm text-green-700 mt-1">
                            Ihr Fahrzeug ist jetzt live und kann von Kunden gebucht
                            werden.
                          </p>
                        </div>
                      </div>
                    </div>
                  )}

                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                    <div>
                      <p className="text-gray-500">Marke</p>
                      <p className="font-medium">
                        {vehicle.technicalData?.brand || 'N/A'}
                      </p>
                    </div>
                    <div>
                      <p className="text-gray-500">Modell</p>
                      <p className="font-medium">
                        {vehicle.technicalData?.model || 'N/A'}
                      </p>
                    </div>
                    <div>
                      <p className="text-gray-500">Jahr</p>
                      <p className="font-medium">
                        {vehicle.technicalData?.year || 'N/A'}
                      </p>
                    </div>
                    <div>
                      <p className="text-gray-500">Preis/Tag</p>
                      <p className="font-medium text-green-600">
                        €{vehicle.pricing?.basePrice?.perDay || 'N/A'}
                      </p>
                    </div>
                  </div>

                  <div className="flex gap-3 pt-4 border-t">
                    <Button
                      size="sm"
                      color="light"
                      onClick={() => window.open(`/vehicles/${vehicle.slug}`, '_blank')}
                    >
                      <FiEye className="mr-2" />
                      Ansehen
                    </Button>
                    <Button
                      size="sm"
                      color="light"
                      onClick={() => toast.info('Bearbeitungsfunktion kommt bald')}
                    >
                      <FiEdit className="mr-2" />
                      Bearbeiten
                    </Button>
                    <Button
                      size="sm"
                      color="failure"
                      onClick={() => handleDeleteVehicle(vehicle._id)}
                    >
                      <FiTrash className="mr-2" />
                      Löschen
                    </Button>
                  </div>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}

      {/* Create Vehicle Modal */}
      <Modal
        show={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        size="xl"
      >
        <Modal.Header>Neues Fahrzeug hinzufügen</Modal.Header>
        <Modal.Body>
          <div className="space-y-4">
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <p className="text-sm text-blue-800">
                <strong>Hinweis:</strong> Um ein neues Fahrzeug hinzuzufügen, verwenden
                Sie bitte das vollständige Formular im Admin-Bereich oder kontaktieren
                Sie den Administrator.
              </p>
              <p className="text-sm text-blue-700 mt-2">
                Ihr Fahrzeug wird nach der Einreichung von unserem Team überprüft und Sie
                erhalten eine Benachrichtigung über die Genehmigung.
              </p>
            </div>
            <div className="text-center py-8">
              <p className="text-gray-600">
                Das vollständige Fahrzeugformular wird hier integriert.
              </p>
              <p className="text-sm text-gray-500 mt-2">
                Für jetzt kontaktieren Sie bitte den Administrator, um ein Fahrzeug
                hinzuzufügen.
              </p>
            </div>
          </div>
        </Modal.Body>
        <Modal.Footer>
          <Button color="gray" onClick={() => setShowCreateModal(false)}>
            Schließen
          </Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
};

export default AgentVehiclesSection;
