import { lazy, Suspense } from "react";
import { Navigate, Route, Routes } from "react-router-dom";
import MainLayout from "./layouts/MainLayout";
import AuthLayout from "./layouts/AuthLayout";
import DashboardLayout from "./layouts/DashboardLayout";
import { AuthProvider } from "./context/AuthContext";
import { BookingProvider } from "./context/BookingContext";
import { PackageProvider } from "./context/PackageContext";

const Home = lazy(() => import("./pages/Home"));
const Packages = lazy(() => import("./pages/Packages"));
const PackageDetail = lazy(() => import("./pages/PackageDetail"));
const CustomTrip = lazy(() => import("./pages/CustomTrip"));
const BookingConfirmation = lazy(() => import("./pages/BookingConfirmation"));
const Customers = lazy(() => import("./pages/Customers"));
const Dashboard = lazy(() => import("./pages/Dashboard"));
const DashboardBookings = lazy(() => import("./pages/DashboardBookings"));
const DashboardWishlist = lazy(() => import("./pages/DashboardWishlist"));
const DashboardProfile = lazy(() => import("./pages/DashboardProfile"));
const Login = lazy(() => import("./pages/Login"));
const Register = lazy(() => import("./pages/Register"));
const ForgotPassword = lazy(() => import("./pages/ForgotPassword"));

function App() {
  return (
    <AuthProvider>
      <PackageProvider>
        <BookingProvider>
          <Suspense fallback={<div className="flex min-h-screen items-center justify-center text-slate-600">Loading…</div>}>
            <Routes>
              <Route element={<MainLayout />}>
                <Route path="/" element={<Home />} />
                <Route path="/packages" element={<Packages />} />
                <Route path="/packages/:id" element={<PackageDetail />} />
                <Route path="/custom-trip" element={<CustomTrip />} />
                <Route path="/booking-confirmation" element={<BookingConfirmation />} />
                <Route path="/customers" element={<Customers />} />
              </Route>

              <Route element={<DashboardLayout />}>
                <Route path="/dashboard" element={<Dashboard />} />
                <Route path="/dashboard/bookings" element={<DashboardBookings />} />
                <Route path="/dashboard/wishlist" element={<DashboardWishlist />} />
                <Route path="/dashboard/profile" element={<DashboardProfile />} />
                <Route path="/dashboard/create-trip" element={<CustomTrip />} />
              </Route>

              <Route element={<AuthLayout />}>
                <Route path="/login" element={<Login />} />
                <Route path="/register" element={<Register />} />
                <Route path="/forgot-password" element={<ForgotPassword />} />
              </Route>

              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </Suspense>
        </BookingProvider>
      </PackageProvider>
    </AuthProvider>
  );
}

export default App;
