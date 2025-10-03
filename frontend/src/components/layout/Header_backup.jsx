import { useContext } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { Navbar, Button, Avatar, Dropdown, Badge } from "flowbite-react";
import { AuthContext } from "../../context/AuthContext";
import { HiPhone, HiMail, HiLocationMarker, HiMenu } from "react-icons/hi";

const Header = () => {
  const { user, logout } = useContext(AuthContext);
  const navigate = useNavigate();
  const location = useLocation();

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

  // Check if current path is active
  const isActive = (path) => {
    return location.pathname === path;
  };

  // Don't render header on landing page
  if (location.pathname === "/") {
    return null;
  }

  return (
    <>
      {/* Top Contact Bar */}
      <div className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white py-2">
        <div className="container mx-auto px-4">
          <div className="flex flex-wrap justify-between items-center text-sm">
            <div className="flex items-center gap-6">
              <a
                href="tel:+4923641234567"
                className="flex items-center gap-2 hover:text-blue-100 transition-colors"
              >
                <HiPhone className="h-4 w-4" />
                <span>+49 2364 - 500 89 49</span>
              </a>
              <a
                href="mailto:info@wohnmobiltraum.de"
                className="flex items-center gap-2 hover:text-blue-100 transition-colors"
              >
                <HiMail className="h-4 w-4" />
                <span>info@wohnmobiltraum.de</span>
              </a>
            </div>
            <div className="flex items-center gap-2">
              <HiLocationMarker className="h-4 w-4" />
              <span>Deutschlandweit verfügbar</span>
            </div>
          </div>
        </div>
      </div>

      {/* Main Navigation */}
      <Navbar
        fluid
        className="bg-white border-b border-gray-200 shadow-lg sticky top-0 z-50"
      >
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between w-full">
            {/* Logo */}
            <Navbar.Brand as={Link} to="/" className="flex items-center group">
              <div className="relative overflow-hidden rounded-xl p-2 transition-all duration-300 group-hover:bg-blue-50 group-hover:shadow-lg group-hover:scale-105">
                <img
                  src="https://926c016b950324a3223fa88ada4966be.cdn.bubble.io/cdn-cgi/image/w=96,h=96,f=auto,dpr=1,fit=contain/f1736249065396x110582480505159840/Logo_FAIRmietung-Haltern.png"
                  alt="WohnmobilTraum Logo"
                  className="h-12 w-12 transition-all duration-300 group-hover:brightness-110"
                />
                <div className="absolute inset-0 bg-blue-200 opacity-0 group-hover:opacity-10 transition-opacity duration-300 rounded-xl"></div>
              </div>
              <div className="ml-3">
                <span className="text-xl font-bold text-gray-900 group-hover:text-blue-600 transition-colors">
                  WohnmobilTraum
                </span>
                <p className="text-xs text-gray-500">
                  Ihre Traumreise beginnt hier
                </p>
              </div>
            </Navbar.Brand>

            {/* Desktop Navigation */}
            <div className="hidden lg:flex items-center space-x-8">
              <nav className="flex items-center space-x-6">
                <Link
                  to="/vehicles"
                  className={`px-3 py-2 rounded-lg font-medium transition-all duration-200 ${
                    isActive("/vehicles")
                      ? "bg-blue-100 text-blue-700"
                      : "text-gray-700 hover:text-blue-600 hover:bg-blue-50"
                  }`}
                >
                  Fahrzeuge
                </Link>
                <Link
                  to="/about"
                  className={`px-3 py-2 rounded-lg font-medium transition-all duration-200 ${
                    isActive("/about")
                      ? "bg-blue-100 text-blue-700"
                      : "text-gray-700 hover:text-blue-600 hover:bg-blue-50"
                  }`}
                >
                  Über uns
                </Link>
                <Link
                  to="/contact"
                  className={`px-3 py-2 rounded-lg font-medium transition-all duration-200 ${
                    isActive("/contact")
                      ? "bg-blue-100 text-blue-700"
                      : "text-gray-700 hover:text-blue-600 hover:bg-blue-50"
                  }`}
                >
                  Kontakt
                </Link>
              </nav>

              {/* User Actions */}
              <div className="flex items-center space-x-4">
                {user ? (
                  <Dropdown
                    arrowIcon={false}
                    inline
                    label={
                      <div className="flex items-center gap-3 p-2 rounded-xl hover:bg-gray-50 transition-colors">
                        <Avatar
                          img={user.profilePicture}
                          alt="User settings"
                          rounded
                          size="sm"
                          className="ring-2 ring-blue-500 ring-offset-2"
                        />
                        <div className="text-left">
                          <p className="text-sm font-semibold text-gray-900">
                            {user.firstName} {user.lastName}
                          </p>
                          <p className="text-xs text-gray-500 capitalize">
                            {user.role}
                          </p>
                        </div>
                      </div>
                    }
                  >
                    <Dropdown.Header>
                      <span className="block text-sm font-medium">
                        {user.firstName} {user.lastName}
                      </span>
                      <span className="block truncate text-sm text-gray-500">
                        {user.email}
                      </span>
                    </Dropdown.Header>
                    <Dropdown.Item as={Link} to={getDashboardPath()}>
                      Dashboard
                    </Dropdown.Item>
                    <Dropdown.Item as={Link} to="/profile">
                      Profil bearbeiten
                    </Dropdown.Item>
                    <Dropdown.Item as={Link} to="/bookings">
                      Meine Buchungen
                    </Dropdown.Item>
                    <Dropdown.Divider />
                    <Dropdown.Item onClick={handleLogout}>
                      Abmelden
                    </Dropdown.Item>
                  </Dropdown>
                ) : (
                  <div className="flex items-center space-x-3">
                    <Button
                      as={Link}
                      to="/login"
                      color="light"
                      size="sm"
                      className="font-medium"
                    >
                      Anmelden
                    </Button>
                    <Button
                      as={Link}
                      to="/register"
                      className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-semibold px-6 py-2 rounded-lg transition-all duration-300 transform hover:scale-105"
                    >
                      Registrieren
                    </Button>
                  </div>
                )}
              </div>
            </div>

            {/* Mobile Menu Button */}
            <div className="lg:hidden">
              <Navbar.Toggle className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg">
                <HiMenu className="h-6 w-6" />
              </Navbar.Toggle>
            </div>
          </div>

          {/* Mobile Navigation */}
          <Navbar.Collapse className="lg:hidden mt-4 border-t border-gray-200 pt-4">
            <div className="flex flex-col space-y-2">
              <Link
                to="/vehicles"
                className={`px-4 py-3 rounded-lg font-medium transition-all duration-200 ${
                  isActive("/vehicles")
                    ? "bg-blue-100 text-blue-700"
                    : "text-gray-700 hover:text-blue-600 hover:bg-blue-50"
                }`}
              >
                Fahrzeuge
              </Link>
              <Link
                to="/about"
                className={`px-4 py-3 rounded-lg font-medium transition-all duration-200 ${
                  isActive("/about")
                    ? "bg-blue-100 text-blue-700"
                    : "text-gray-700 hover:text-blue-600 hover:bg-blue-50"
                }`}
              >
                Über uns
              </Link>
              <Link
                to="/contact"
                className={`px-4 py-3 rounded-lg font-medium transition-all duration-200 ${
                  isActive("/contact")
                    ? "bg-blue-100 text-blue-700"
                    : "text-gray-700 hover:text-blue-600 hover:bg-blue-50"
                }`}
              >
                Kontakt
              </Link>
              
              {/* Mobile User Actions */}
              <div className="pt-4 border-t border-gray-200 mt-4">
                {user ? (
                  <div className="space-y-2">
                    <div className="flex items-center gap-3 px-4 py-3">
                      <Avatar
                        img={user.profilePicture}
                        alt="User"
                        rounded
                        size="sm"
                      />
                      <div>
                        <p className="text-sm font-semibold text-gray-900">
                          {user.firstName} {user.lastName}
                        </p>
                        <p className="text-xs text-gray-500 capitalize">
                          {user.role}
                        </p>
                      </div>
                    </div>
                    <Link
                      to={getDashboardPath()}
                      className="block px-4 py-3 text-gray-700 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                    >
                      Dashboard
                    </Link>
                    <Link
                      to="/profile"
                      className="block px-4 py-3 text-gray-700 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                    >
                      Profil bearbeiten
                    </Link>
                    <Link
                      to="/bookings"
                      className="block px-4 py-3 text-gray-700 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                    >
                      Meine Buchungen
                    </Link>
                    <button
                      onClick={handleLogout}
                      className="block w-full text-left px-4 py-3 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                    >
                      Abmelden
                    </button>
                  </div>
                ) : (
                  <div className="space-y-3">
                    <Button
                      as={Link}
                      to="/login"
                      color="light"
                      className="w-full justify-center"
                    >
                      Anmelden
                    </Button>
                    <Button
                      as={Link}
                      to="/register"
                      className="w-full justify-center bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-semibold"
                    >
                      Registrieren
                    </Button>
                  </div>
                )}
              </div>
            </div>
          </Navbar.Collapse>
        </div>
      </Navbar>
    </>
  );
};

export default Header;
                      />
                      {user.role !== "user" && (
                        <Badge
                          color={user.role === "admin" ? "purple" : "indigo"}
                        >
                          {user.role === "admin" ? "Admin" : "Agent"}
                        </Badge>
                      )}
                    </div>
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
                  <Dropdown.Item onClick={handleLogout} className="text-red-600">
                    Abmelden
                  </Dropdown.Item>
                </Dropdown>
              ) : (
                <div className="flex items-center space-x-2">
                  <Button
                    as={Link}
                    to="/login"
                    color="light"
                    size="sm"
                    className="hover:bg-gray-100"
                  >
                    Anmelden
                  </Button>
                  <Button
                    as={Link}
                    to="/register"
                    size="sm"
                    className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700"
                  >
                    Registrieren
                  </Button>
                </div>
              )}
              <Navbar.Toggle />
            </div>

            <Navbar.Collapse>
              <Navbar.Link
                as={Link}
                to="/"
                active={isActive("/")}
                className={`${
                  isActive("/")
                    ? "text-blue-600 font-semibold"
                    : "text-gray-700"
                } hover:text-blue-600 transition-colors`}
              >
                Startseite
              </Navbar.Link>
              <Navbar.Link
                as={Link}
                to="/vehicles"
                active={isActive("/vehicles")}
                className={`${
                  isActive("/vehicles")
                    ? "text-blue-600 font-semibold"
                    : "text-gray-700"
                } hover:text-blue-600 transition-colors`}
              >
                Fahrzeuge
              </Navbar.Link>
              <Navbar.Link
                as={Link}
                to="/about"
                active={isActive("/about")}
                className={`${
                  isActive("/about")
                    ? "text-blue-600 font-semibold"
                    : "text-gray-700"
                } hover:text-blue-600 transition-colors`}
              >
                Über uns
              </Navbar.Link>
              <Navbar.Link
                as={Link}
                to="/contact"
                active={isActive("/contact")}
                className={`${
                  isActive("/contact")
                    ? "text-blue-600 font-semibold"
                    : "text-gray-700"
                } hover:text-blue-600 transition-colors`}
              >
                Kontakt
              </Navbar.Link>
              {user && (
                <Navbar.Link
                  as={Link}
                  to={getDashboardPath()}
                  active={location.pathname.includes("dashboard")}
                  className={`${
                    location.pathname.includes("dashboard")
                      ? "text-blue-600 font-semibold"
                      : "text-gray-700"
                  } hover:text-blue-600 transition-colors`}
                >
                  Dashboard
                </Navbar.Link>
              )}
            </Navbar.Collapse>
          </div>
        </div>
      </Navbar>
    </>
  );
};

export default Header;
