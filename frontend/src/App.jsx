import React from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import { AuthProvider, AuthContext } from "./context/AuthContext"; // Context for auth state
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import Dashboard from "./pages/Dashboard";
// import Navbar from './components/Navbar'; // Optional: Include a Navbar if desired

const App = () => {
  return (
    <AuthProvider>
      <Router>
        {/* Optional Navbar */}
        {/* <Navbar /> */}
        <Routes>
          {/* Protected Dashboard Route */}
          <Route
            path="/dashboard"
            element={
              <ProtectedRoute>
                <Dashboard />
              </ProtectedRoute>
            }
          />

          {/* Public Routes */}
          <Route path="/signup" element={<Signup />} />
          <Route path="/login" element={<Login />} />

          {/* Redirect root to dashboard if authenticated, else to login */}
          <Route path="/" element={<DefaultRoute />} />

          {/* Redirect unknown routes to home */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Router>
    </AuthProvider>
  );
};

// ProtectedRoute component to guard private routes
const ProtectedRoute = ({ children }) => {
  const { auth } = React.useContext(AuthContext);

  if (!auth.token) {
    return <Navigate to="/login" replace />;
  }

  return children;
};

// DefaultRoute component to redirect based on authentication
const DefaultRoute = () => {
  const { auth } = React.useContext(AuthContext);

  return auth.token ? (
    <Navigate to="/dashboard" replace />
  ) : (
    <Navigate to="/login" replace />
  );
};

export default App;
