import { Navigate, Route, Routes } from "react-router-dom";
import { AppProvider, useApp } from "./context/AppContext";
import AppLayout from "./components/layout/AppLayout";
import HomePage from "./pages/public/HomePage";
import LoginPage from "./pages/auth/LoginPage";
import RegisterPage from "./pages/auth/RegisterPage";
import CatalogPage from "./pages/student/CatalogPage";
import BookDetailPage from "./pages/student/BookDetailPage";
import MyBooksPage from "./pages/student/MyBooksPage";
import DashboardPage from "./pages/admin/DashboardPage";
import AdminCatalogPage from "./pages/admin/AdminCatalogPage";
import RequestsPage from "./pages/admin/RequestsPage";
import ActiveBorrowsPage from "./pages/admin/ActiveBorrowsPage";
import ReportsPage from "./pages/admin/ReportsPage";
import NotFoundPage from "./pages/NotFoundPage";
import "./App.css";

function ProtectedRoute({ children, requiredRole }) {
  const { currentUser, isInitializing } = useApp();

  if (isInitializing) return null;
  if (!currentUser) return <Navigate to="/login" replace />;
  if (requiredRole && currentUser.role !== requiredRole) {
    return <Navigate to="/" replace />;
  }

  return children;
}

function AuthRedirect({ children }) {
  const { currentUser, isInitializing } = useApp();

  if (isInitializing) return null;
  if (currentUser) {
    return (
      <Navigate
        to={currentUser.role === "admin" ? "/admin/dashboard" : "/catalog"}
        replace
      />
    );
  }

  return children;
}

function AppRoutes() {
  return (
    <Routes>
      <Route
        path="/"
        element={
          <AuthRedirect>
            <HomePage />
          </AuthRedirect>
        }
      />
      <Route
        path="/login"
        element={
          <AuthRedirect>
            <LoginPage />
          </AuthRedirect>
        }
      />
      <Route
        path="/register"
        element={
          <AuthRedirect>
            <RegisterPage />
          </AuthRedirect>
        }
      />

      <Route
        element={
          <ProtectedRoute requiredRole="member">
            <AppLayout />
          </ProtectedRoute>
        }
      >
        <Route path="/catalog" element={<CatalogPage />} />
        <Route path="/books/:id" element={<BookDetailPage />} />
        <Route path="/my-books" element={<MyBooksPage />} />
        <Route path="/dashboard" element={<Navigate to="/catalog" replace />} />
      </Route>

      <Route
        element={
          <ProtectedRoute requiredRole="admin">
            <AppLayout />
          </ProtectedRoute>
        }
      >
        <Route path="/admin/dashboard" element={<DashboardPage />} />
        <Route path="/admin/catalog" element={<AdminCatalogPage />} />
        <Route path="/admin/requests" element={<RequestsPage />} />
        <Route path="/admin/active-borrows" element={<ActiveBorrowsPage />} />
        <Route path="/admin/reports" element={<ReportsPage />} />
        <Route
          path="/librarian"
          element={<Navigate to="/admin/dashboard" replace />}
        />
      </Route>

      <Route path="*" element={<NotFoundPage />} />
    </Routes>
  );
}

function App() {
  return (
    <AppProvider>
      <AppRoutes />
    </AppProvider>
  );
}

export default App;
