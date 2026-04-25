import { Navigate } from "react-router-dom";
import { useAuth } from "../lib/AuthContext";

export default function ProtectedRoute({ children }) {
  const { user, isLoadingAuth } = useAuth();

  // ⛔ wait until auth is loaded
  if (isLoadingAuth) return null;

  if (!user) {
    return <Navigate to="/login" />;
  }

  return children;
}