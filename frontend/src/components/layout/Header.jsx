import { useContext } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Navbar, Button, Avatar, Dropdown } from "flowbite-react";
import { AuthContext } from "../../context/AuthContext";

const Header = () => {
  const { user, logout } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate("/");
  };

  // Helper function to get role-based dashboard path
  const getDashboardPath = () => {
    if (!user) return "/dashboard";
    switch (user.role) {
      case "admin":
        return "/admin/dashboard";
      case "agent":
        return "/agent/dashboard";
      default:
        return "/dashboard";
    }
  };

  return (
    <Navbar fluid className="bg-white border-b border-gray-200 px-4 py-2">
      <Navbar.Brand as={Link} to="/" className="flex items-center">
        <img
          src="https://926c016b950324a3223fa88ada4966be.cdn.bubble.io/cdn-cgi/image/w=96,h=96,f=auto,dpr=1,fit=contain/f1736249065396x110582480505159840/Logo_FAIRmietung-Haltern.png"
          alt="WohnmobilTraum Logo"
          className="h-12 w-12 mr-3"
        />
        <span className="self-center whitespace-nowrap text-xl font-semibold text-gray-900">
          WohnmobilTraum
        </span>
      </Navbar.Brand>

      <div className="flex md:order-2 items-center space-x-3">
        {user ? (
          <Dropdown
            arrowIcon={false}
            inline
            label={
              <Avatar alt="User settings" img={user.profilePicture} rounded />
            }
          >
            <Dropdown.Header>
              <span className="block text-sm font-medium">
                {user.firstName} {user.lastName}
              </span>
              <span className="block truncate text-sm font-light text-gray-500">
                {user.email}
              </span>
            </Dropdown.Header>
            <Dropdown.Item as={Link} to={getDashboardPath()}>
              Dashboard
            </Dropdown.Item>
            {user.role === "user" && (
              <>
                <Dropdown.Item as={Link} to="/dashboard/bookings">
                  Meine Buchungen
                </Dropdown.Item>
                <Dropdown.Item as={Link} to="/dashboard/profile">
                  Profil
                </Dropdown.Item>
              </>
            )}
            {(user.role === "agent" || user.role === "admin") && (
              <>
                <Dropdown.Item as={Link} to={`${getDashboardPath()}/profile`}>
                  Profil
                </Dropdown.Item>
                <Dropdown.Item as={Link} to="/dashboard/vehicles">
                  Fahrzeuge verwalten
                </Dropdown.Item>
              </>
            )}
            <Dropdown.Divider />
            <Dropdown.Item onClick={handleLogout}>Abmelden</Dropdown.Item>
          </Dropdown>
        ) : (
          <div className="flex items-center space-x-2">
            <Button as={Link} to="/login" color="light" size="sm">
              Anmelden
            </Button>
            <Button as={Link} to="/register" color="blue" size="sm">
              Registrieren
            </Button>
          </div>
        )}
        <Navbar.Toggle />
      </div>

      <Navbar.Collapse>
        <Navbar.Link as={Link} to="/" active={window.location.pathname === "/"}>
          Startseite
        </Navbar.Link>
        <Navbar.Link
          as={Link}
          to="/vehicles"
          active={window.location.pathname.includes("/vehicles")}
        >
          Fahrzeuge
        </Navbar.Link>
        <Navbar.Link
          as={Link}
          to="/about"
          active={window.location.pathname === "/about"}
        >
          Über uns
        </Navbar.Link>
        <Navbar.Link
          as={Link}
          to="/contact"
          active={window.location.pathname === "/contact"}
        >
          Kontakt
        </Navbar.Link>
      </Navbar.Collapse>
    </Navbar>
  );
};

export default Header;
