import React, { useState, useEffect, useContext, useCallback } from "react";
import {
  Tabs,
  Card,
  Table,
  Badge,
  Button,
  Spinner,
  Alert,
  Pagination,
} from "flowbite-react";
import { AuthContext } from "../../context/AuthContext";
import api from "../../services/api";
import {
  FiUser,
  FiUsers,
  FiTruck,
  FiCalendar,
  FiCheck,
  FiX,
} from "react-icons/fi";

const AdminPanel = () => {
  const { user } = useContext(AuthContext);
  const [activeTab, setActiveTab] = useState("users");
  const [users, setUsers] = useState([]);
  const [agents, setAgents] = useState([]);
  const [pendingAgents, setPendingAgents] = useState([]);
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  useEffect(() => {
    if (user?.role !== "admin") {
      setError("Sie haben keine Berechtigung, auf diesen Bereich zuzugreifen.");
      return;
    }

    fetchData();
  }, [user, activeTab, currentPage, fetchData]);

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      setError("");

      switch (activeTab) {
        case "users":
          await fetchUsers();
          break;
        case "agents":
          await fetchAgents();
          break;
        case "pendingAgents":
          await fetchPendingAgents();
          break;
        case "bookings":
          await fetchBookings();
          break;
        default:
          await fetchUsers();
      }
    } catch (error) {
      console.error("Fehler beim Laden der Daten:", error);
      setError(
        "Die Daten konnten nicht geladen werden. Bitte versuchen Sie es später erneut."
      );
    } finally {
      setLoading(false);
    }
  }, [activeTab, fetchUsers, fetchAgents, fetchPendingAgents, fetchBookings]);

  const fetchUsers = useCallback(async () => {
    const response = await api.get(`/admin/users?page=${currentPage}&limit=10`);
    setUsers(response.data.users);
    setTotalPages(Math.ceil(response.data.total / 10));
  }, [currentPage]);

  const fetchAgents = useCallback(async () => {
    const response = await api.get(
      `/admin/agents?page=${currentPage}&limit=10`
    );
    setAgents(response.data.agents);
    setTotalPages(Math.ceil(response.data.total / 10));
  }, [currentPage]);

  const fetchPendingAgents = useCallback(async () => {
    const response = await api.get(
      `/admin/agents/pending?page=${currentPage}&limit=10`
    );
    setPendingAgents(response.data.pendingAgents);
    setTotalPages(Math.ceil(response.data.total / 10));
  }, [currentPage]);

  const fetchBookings = useCallback(async () => {
    const response = await api.get(
      `/admin/bookings?page=${currentPage}&limit=10`
    );
    setBookings(response.data.bookings);
    setTotalPages(Math.ceil(response.data.total / 10));
  }, [currentPage]);

  const approveAgent = async (userId) => {
    try {
      await api.put(`/admin/agents/${userId}/approve`);
      setPendingAgents(pendingAgents.filter((agent) => agent._id !== userId));
    } catch (error) {
      console.error("Fehler beim Genehmigen des Vermieters:", error);
      alert(
        "Der Vermieter konnte nicht genehmigt werden. Bitte versuchen Sie es später erneut."
      );
    }
  };

  const rejectAgent = async (userId) => {
    try {
      await api.put(`/admin/agents/${userId}/reject`);
      setPendingAgents(pendingAgents.filter((agent) => agent._id !== userId));
    } catch (error) {
      console.error("Fehler beim Ablehnen des Vermieters:", error);
      alert(
        "Der Vermieter konnte nicht abgelehnt werden. Bitte versuchen Sie es später erneut."
      );
    }
  };

  if (error) {
    return <Alert color="failure">{error}</Alert>;
  }

  const renderContent = () => {
    if (loading) {
      return (
        <div className="flex justify-center items-center p-8">
          <Spinner size="xl" />
        </div>
      );
    }

    switch (activeTab) {
      case "users":
        return renderUsers();
      case "agents":
        return renderAgents();
      case "pendingAgents":
        return renderPendingAgents();
      case "bookings":
        return renderBookings();
      default:
        return renderUsers();
    }
  };

  const renderUsers = () => {
    if (users.length === 0) {
      return <p className="text-center py-4">Keine Benutzer gefunden.</p>;
    }

    return (
      <>
        <div className="overflow-x-auto">
          <Table hoverable>
            <Table.Head>
              <Table.HeadCell>Name</Table.HeadCell>
              <Table.HeadCell>E-Mail</Table.HeadCell>
              <Table.HeadCell>Rolle</Table.HeadCell>
              <Table.HeadCell>Status</Table.HeadCell>
              <Table.HeadCell>Registriert am</Table.HeadCell>
              <Table.HeadCell>Aktionen</Table.HeadCell>
            </Table.Head>

            <Table.Body>
              {users.map((user) => (
                <Table.Row key={user._id} className="bg-white">
                  <Table.Cell className="font-medium text-gray-900">
                    {user.firstName} {user.lastName}
                  </Table.Cell>
                  <Table.Cell>{user.email}</Table.Cell>
                  <Table.Cell>
                    {user.role === "admin" && (
                      <Badge color="purple">Administrator</Badge>
                    )}
                    {user.role === "agent" && (
                      <Badge color="blue">Vermieter</Badge>
                    )}
                    {user.role === "user" && <Badge color="gray">Kunde</Badge>}
                  </Table.Cell>
                  <Table.Cell>
                    {user.isVerified ? (
                      <Badge color="success">Verifiziert</Badge>
                    ) : (
                      <Badge color="warning">Nicht verifiziert</Badge>
                    )}
                  </Table.Cell>
                  <Table.Cell>
                    {new Date(user.createdAt).toLocaleDateString("de-DE")}
                  </Table.Cell>
                  <Table.Cell>
                    <Button.Group>
                      <Button size="xs" color="light">
                        Details
                      </Button>
                      {user.isActive ? (
                        <Button size="xs" color="failure">
                          Sperren
                        </Button>
                      ) : (
                        <Button size="xs" color="success">
                          Entsperren
                        </Button>
                      )}
                    </Button.Group>
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
    );
  };

  const renderAgents = () => {
    if (agents.length === 0) {
      return <p className="text-center py-4">Keine Vermieter gefunden.</p>;
    }

    return (
      <>
        <div className="overflow-x-auto">
          <Table hoverable>
            <Table.Head>
              <Table.HeadCell>Name</Table.HeadCell>
              <Table.HeadCell>E-Mail</Table.HeadCell>
              <Table.HeadCell>Status</Table.HeadCell>
              <Table.HeadCell>Fahrzeuge</Table.HeadCell>
              <Table.HeadCell>Beitritt am</Table.HeadCell>
              <Table.HeadCell>Aktionen</Table.HeadCell>
            </Table.Head>

            <Table.Body>
              {agents.map((agent) => (
                <Table.Row key={agent._id} className="bg-white">
                  <Table.Cell className="font-medium text-gray-900">
                    {agent.firstName} {agent.lastName}
                  </Table.Cell>
                  <Table.Cell>{agent.email}</Table.Cell>
                  <Table.Cell>
                    {agent.isActive ? (
                      <Badge color="success">Aktiv</Badge>
                    ) : (
                      <Badge color="failure">Inaktiv</Badge>
                    )}
                  </Table.Cell>
                  <Table.Cell>{agent.vehicleCount || 0}</Table.Cell>
                  <Table.Cell>
                    {new Date(agent.createdAt).toLocaleDateString("de-DE")}
                  </Table.Cell>
                  <Table.Cell>
                    <Button.Group>
                      <Button size="xs" color="light">
                        Details
                      </Button>
                      <Button size="xs" color="info">
                        Fahrzeuge
                      </Button>
                    </Button.Group>
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
    );
  };

  const renderPendingAgents = () => {
    if (pendingAgents.length === 0) {
      return (
        <p className="text-center py-4">Keine ausstehenden Vermieteranträge.</p>
      );
    }

    return (
      <>
        <div className="overflow-x-auto">
          <Table hoverable>
            <Table.Head>
              <Table.HeadCell>Name</Table.HeadCell>
              <Table.HeadCell>E-Mail</Table.HeadCell>
              <Table.HeadCell>Telefon</Table.HeadCell>
              <Table.HeadCell>Beantragt am</Table.HeadCell>
              <Table.HeadCell>Aktionen</Table.HeadCell>
            </Table.Head>

            <Table.Body>
              {pendingAgents.map((agent) => (
                <Table.Row key={agent._id} className="bg-white">
                  <Table.Cell className="font-medium text-gray-900">
                    {agent.firstName} {agent.lastName}
                  </Table.Cell>
                  <Table.Cell>{agent.email}</Table.Cell>
                  <Table.Cell>
                    {agent.profile?.phone || "Nicht angegeben"}
                  </Table.Cell>
                  <Table.Cell>
                    {new Date(agent.agentApplication?.date).toLocaleDateString(
                      "de-DE"
                    )}
                  </Table.Cell>
                  <Table.Cell>
                    <div className="flex space-x-2">
                      <Button
                        size="xs"
                        color="success"
                        onClick={() => approveAgent(agent._id)}
                      >
                        <FiCheck className="mr-1" /> Genehmigen
                      </Button>
                      <Button
                        size="xs"
                        color="failure"
                        onClick={() => rejectAgent(agent._id)}
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
    );
  };

  const renderBookings = () => {
    if (bookings.length === 0) {
      return <p className="text-center py-4">Keine Buchungen gefunden.</p>;
    }

    return (
      <>
        <div className="overflow-x-auto">
          <Table hoverable>
            <Table.Head>
              <Table.HeadCell>Buchungs-ID</Table.HeadCell>
              <Table.HeadCell>Kunde</Table.HeadCell>
              <Table.HeadCell>Fahrzeug</Table.HeadCell>
              <Table.HeadCell>Zeitraum</Table.HeadCell>
              <Table.HeadCell>Status</Table.HeadCell>
              <Table.HeadCell>Gesamtpreis</Table.HeadCell>
            </Table.Head>

            <Table.Body>
              {bookings.map((booking) => (
                <Table.Row key={booking._id} className="bg-white">
                  <Table.Cell className="font-medium text-gray-900">
                    #{booking._id.substring(0, 8)}
                  </Table.Cell>
                  <Table.Cell>
                    {booking.user?.firstName} {booking.user?.lastName}
                  </Table.Cell>
                  <Table.Cell>
                    {booking.vehicle?.name || "Unbekannt"}
                  </Table.Cell>
                  <Table.Cell>
                    {new Date(booking.startDate).toLocaleDateString("de-DE")} -{" "}
                    {new Date(booking.endDate).toLocaleDateString("de-DE")}
                  </Table.Cell>
                  <Table.Cell>
                    {booking.status === "pending" && (
                      <Badge color="warning">Ausstehend</Badge>
                    )}
                    {booking.status === "confirmed" && (
                      <Badge color="success">Bestätigt</Badge>
                    )}
                    {booking.status === "active" && (
                      <Badge color="info">Aktiv</Badge>
                    )}
                    {booking.status === "completed" && (
                      <Badge color="success">Abgeschlossen</Badge>
                    )}
                    {booking.status === "cancelled" && (
                      <Badge color="failure">Storniert</Badge>
                    )}
                  </Table.Cell>
                  <Table.Cell>{booking.totalPrice?.toFixed(2)} €</Table.Cell>
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
    );
  };

  return (
    <Card>
      <h2 className="text-2xl font-semibold mb-4">Admin-Bereich</h2>

      <Tabs.Group
        style="underline"
        onActiveTabChange={(tab) => {
          setActiveTab(
            tab === 0
              ? "users"
              : tab === 1
              ? "agents"
              : tab === 2
              ? "pendingAgents"
              : "bookings"
          );
          setCurrentPage(1);
        }}
      >
        <Tabs.Item
          active={activeTab === "users"}
          title="Benutzer"
          icon={FiUsers}
        >
          {renderContent()}
        </Tabs.Item>

        <Tabs.Item
          active={activeTab === "agents"}
          title="Vermieter"
          icon={FiUser}
        >
          {renderContent()}
        </Tabs.Item>

        <Tabs.Item
          active={activeTab === "pendingAgents"}
          title="Vermieteranträge"
          icon={FiCheck}
          badge={
            pendingAgents.length > 0
              ? pendingAgents.length.toString()
              : undefined
          }
          badgeColor="warning"
        >
          {renderContent()}
        </Tabs.Item>

        <Tabs.Item
          active={activeTab === "bookings"}
          title="Buchungen"
          icon={FiCalendar}
        >
          {renderContent()}
        </Tabs.Item>
      </Tabs.Group>
    </Card>
  );
};

export default AdminPanel;
