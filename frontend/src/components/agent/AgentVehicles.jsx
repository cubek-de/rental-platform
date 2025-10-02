import React, { useState, useEffect, useContext } from "react";
import {
  Table,
  Button,
  Badge,
  Card,
  Spinner,
  Alert,
  Pagination,
  Modal,
} from "flowbite-react";
import { AuthContext } from "../../context/AuthContext";
import api from "../../services/api";
import { FiEdit, FiTrash, FiEye, FiPlus } from "react-icons/fi";
import { Link } from "react-router-dom";

const AgentVehicles = () => {
  const { user } = useContext(AuthContext);
  const [vehicles, setVehicles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [vehicleToDelete, setVehicleToDelete] = useState(null);

  useEffect(() => {
    if (user && (user.role === "agent" || user.role === "admin")) {
      fetchVehicles();
    }
  }, [user, currentPage]);

  const fetchVehicles = async () => {
    try {
      setLoading(true);
      setError("");
      const endpoint =
        user.role === "admin"
          ? `/vehicles?page=${currentPage}&limit=10`
          : `/vehicles/agent?page=${currentPage}&limit=10`;

      const response = await api.get(endpoint);
      setVehicles(response.data.vehicles || []);
      setTotalPages(Math.ceil(response.data.total / 10) || 1);
    } catch (error) {
      console.error("Fehler beim Laden der Fahrzeuge:", error);
      setError(
        "Die Fahrzeuge konnten nicht geladen werden. Bitte versuchen Sie es später erneut."
      );
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteClick = (vehicle) => {
    setVehicleToDelete(vehicle);
    setDeleteModalOpen(true);
  };

  const confirmDelete = async () => {
    if (!vehicleToDelete) return;

    try {
      await api.delete(`/vehicles/${vehicleToDelete._id}`);
      setVehicles(vehicles.filter((v) => v._id !== vehicleToDelete._id));
      setDeleteModalOpen(false);
      setVehicleToDelete(null);
    } catch (error) {
      console.error("Fehler beim Löschen des Fahrzeugs:", error);
      alert(
        "Das Fahrzeug konnte nicht gelöscht werden. Bitte versuchen Sie es später erneut."
      );
    }
  };

  const getStatusBadge = (isAvailable) => {
    return isAvailable ? (
      <Badge color="success">Verfügbar</Badge>
    ) : (
      <Badge color="gray">Nicht verfügbar</Badge>
    );
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

  return (
    <>
      <Card>
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold">Meine Fahrzeuge</h2>
          <Button as={Link} to="/vehicles/new">
            <FiPlus className="mr-2" /> Fahrzeug hinzufügen
          </Button>
        </div>

        {vehicles.length === 0 ? (
          <div className="text-center py-8">
            <h3 className="text-lg font-medium mb-2">
              Keine Fahrzeuge gefunden
            </h3>
            <p className="text-gray-500 mb-4">
              Sie haben noch keine Fahrzeuge hinzugefügt.
            </p>
            <Button as={Link} to="/vehicles/new">
              Erstes Fahrzeug hinzufügen
            </Button>
          </div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <Table hoverable>
                <Table.Head>
                  <Table.HeadCell>Bild</Table.HeadCell>
                  <Table.HeadCell>Name</Table.HeadCell>
                  <Table.HeadCell>Kategorie</Table.HeadCell>
                  <Table.HeadCell>Preis/Tag</Table.HeadCell>
                  <Table.HeadCell>Status</Table.HeadCell>
                  <Table.HeadCell>Aktionen</Table.HeadCell>
                </Table.Head>

                <Table.Body>
                  {vehicles.map((vehicle) => (
                    <Table.Row key={vehicle._id} className="bg-white">
                      <Table.Cell>
                        <img
                          src={
                            vehicle.images[0] ||
                            "/src/assets/vehicle-placeholder.png"
                          }
                          alt={vehicle.name}
                          className="w-16 h-12 object-cover rounded"
                        />
                      </Table.Cell>
                      <Table.Cell className="font-medium text-gray-900">
                        {vehicle.name}
                      </Table.Cell>
                      <Table.Cell>{vehicle.category}</Table.Cell>
                      <Table.Cell>
                        {vehicle.pricePerDay.toFixed(2)} €
                      </Table.Cell>
                      <Table.Cell>
                        {getStatusBadge(vehicle.isAvailable)}
                      </Table.Cell>
                      <Table.Cell>
                        <div className="flex space-x-2">
                          <Button
                            size="xs"
                            color="info"
                            as={Link}
                            to={`/vehicles/${vehicle._id}`}
                          >
                            <FiEye className="mr-1" /> Ansehen
                          </Button>

                          <Button
                            size="xs"
                            color="warning"
                            as={Link}
                            to={`/vehicles/edit/${vehicle._id}`}
                          >
                            <FiEdit className="mr-1" /> Bearbeiten
                          </Button>

                          <Button
                            size="xs"
                            color="failure"
                            onClick={() => handleDeleteClick(vehicle)}
                          >
                            <FiTrash className="mr-1" /> Löschen
                          </Button>
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
          </>
        )}
      </Card>

      <Modal
        show={deleteModalOpen}
        onClose={() => setDeleteModalOpen(false)}
        popup
      >
        <Modal.Header />
        <Modal.Body>
          <div className="text-center">
            <h3 className="mb-5 text-lg font-normal text-gray-500">
              Sind Sie sicher, dass Sie das Fahrzeug
              <span className="font-semibold"> {vehicleToDelete?.name} </span>
              löschen möchten?
            </h3>
            <div className="flex justify-center gap-4">
              <Button color="failure" onClick={confirmDelete}>
                Ja, löschen
              </Button>
              <Button color="gray" onClick={() => setDeleteModalOpen(false)}>
                Abbrechen
              </Button>
            </div>
          </div>
        </Modal.Body>
      </Modal>
    </>
  );
};

export default AgentVehicles;
