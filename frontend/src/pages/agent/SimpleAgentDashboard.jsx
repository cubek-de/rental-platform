import React, { useContext } from "react";
import { AuthContext } from "../../context/AuthContext";
import { Navigate } from "react-router-dom";

const SimpleAgentDashboard = () => {
  const { user, loading } = useContext(AuthContext);

  console.log("SimpleAgentDashboard - User:", user, "Loading:", loading);

  if (loading) {
    return <div className="p-8">Loading...</div>;
  }

  if (!user || (user.role !== "agent" && user.role !== "admin")) {
    return <Navigate to="/login" replace />;
  }

  return (
    <div className="p-8">
      <h1 className="text-3xl font-bold mb-4">Simple Agent Dashboard</h1>
      <div className="bg-blue-50 p-4 rounded mb-4">
        <p>
          <strong>User:</strong> {user.firstName} {user.lastName}
        </p>
        <p>
          <strong>Email:</strong> {user.email}
        </p>
        <p>
          <strong>Role:</strong> {user.role}
        </p>
      </div>
      <div className="bg-green-50 p-4 rounded">
        <p>✅ Agent dashboard is working!</p>
      </div>
    </div>
  );
};

export default SimpleAgentDashboard;
