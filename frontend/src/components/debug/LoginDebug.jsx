import React, { useContext } from "react";
import { AuthContext } from "../../context/AuthContext";

const LoginDebug = () => {
  const { user, loading, login } = useContext(AuthContext);

  const handleDebugLogin = async () => {
    try {
      console.log("=== DEBUG LOGIN START ===");
      const result = await login("admin@gmail.com", "Admin@2024#Secure");
      console.log("=== LOGIN RESULT ===", result);
      console.log("=== USER AFTER LOGIN ===", user);
    } catch (error) {
      console.error("=== LOGIN ERROR ===", error);
    }
  };

  return (
    <div className="p-4 border border-red-500 m-4">
      <h3 className="text-red-600 font-bold">DEBUG LOGIN</h3>
      <p>Loading: {loading ? "YES" : "NO"}</p>
      <p>
        User:{" "}
        {user ? JSON.stringify({ role: user.role, email: user.email }) : "NULL"}
      </p>
      <button
        onClick={handleDebugLogin}
        className="bg-red-500 text-white px-4 py-2 rounded mt-2"
      >
        DEBUG LOGIN
      </button>
    </div>
  );
};

export default LoginDebug;
