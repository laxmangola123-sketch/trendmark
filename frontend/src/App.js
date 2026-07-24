import React from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";

import { AuthProvider } from "./lib/auth";
import Analytics from "./pages/Analytics";
import Landing from "./pages/Landing";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import Plans from "./pages/Plans";
import Dashboard from "./pages/Dashboard";
import Markets from "./pages/Markets";
import Portfolio from "./pages/Portfolio";
import Watchlist from "./pages/Watchlist";
import Admin from "./pages/Admin";

import DashboardLayout from "./components/DashboardLayout";

function App() {
    return (
        <AuthProvider>
            <BrowserRouter>
                <Routes>
                    {/* Public Routes */}
                    <Route path="/" element={<Landing />} />
                    <Route path="/login" element={<Login />} />
                    <Route path="/signup" element={<Signup />} />
                    <Route path="/admin" element={<Admin />} />

                    {/* Dashboard Layout */}
                    <Route element={<DashboardLayout />}>
                        <Route path="/dashboard" element={<Dashboard />} />
                        <Route path="/dashboard/markets" element={<Markets />} />
                        <Route path="/dashboard/portfolio" element={<Portfolio />} />
                        <Route path="/dashboard/watchlist" element={<Watchlist />} />
                        <Route path="/dashboard/plans" element={<Plans />} />
                        <Route path="/dashboard/analytics" element={<Analytics />} />
                    </Route>

                    {/* Optional redirects / old URLs */}
                    <Route path="/plans" element={<Plans />} />
                    <Route path="/markets" element={<Markets />} />
                    <Route path="/portfolio" element={<Portfolio />} />
                    <Route path="/watchlist" element={<Watchlist />} />
                    <Route path="/analytics" element={<Analytics />} />
                </Routes>
            </BrowserRouter>
        </AuthProvider>
    );
}

export default App;