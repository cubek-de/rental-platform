import { Link } from "react-router-dom";
import { Button } from "flowbite-react";
import { HiHome } from "react-icons/hi";

const NotFoundPage = () => {
  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100">
      <div className="text-center p-6">
        <h1 className="text-6xl font-bold text-blue-700 mb-4">404</h1>
        <h2 className="text-3xl font-semibold mb-6">Seite nicht gefunden</h2>
        <p className="text-lg text-gray-600 mb-8">
          Die von Ihnen gesuchte Seite existiert nicht oder wurde verschoben.
        </p>
        <Button as={Link} to="/" color="primary" size="lg">
          <HiHome className="mr-2 h-5 w-5" />
          Zurück zur Startseite
        </Button>
      </div>
    </div>
  );
};

export default NotFoundPage;
