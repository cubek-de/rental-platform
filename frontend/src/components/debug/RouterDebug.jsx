import React, { useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";

const RouterDebug = () => {
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    console.log("=== ROUTER DEBUG ===");
    console.log("Current location:", location);
    console.log("Pathname:", location.pathname);
    console.log("Search:", location.search);
    console.log("State:", location.state);
  }, [location]);

  return (
    <div className="fixed top-0 right-0 bg-yellow-200 p-2 text-xs z-50 max-w-xs">
      <h4 className="font-bold">Router Debug</h4>
      <p>Path: {location.pathname}</p>
      <p>Search: {location.search}</p>
      <div className="mt-2">
        <button
          onClick={() => navigate("/admin/dashboard")}
          className="bg-red-500 text-white px-2 py-1 text-xs mr-1"
        >
          Go Admin
        </button>
        <button
          onClick={() => navigate("/agent/dashboard")}
          className="bg-blue-500 text-white px-2 py-1 text-xs"
        >
          Go Agent
        </button>
      </div>
    </div>
  );
};

export default RouterDebug;
