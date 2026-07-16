import React from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";

import { AuthProvider } from "./lib/auth";

import Landing from "./pages/Landing";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import Plans from "./pages/Plans";
import Dashboard from "./pages/Dashboard";
import Markets from "./pages/Markets";
import Portfolio from "./pages/Portfolio";
import Watchlist from "./pages/Watchlist";
import Kyc from "./pages/Kyc";
import Admin from "./pages/Admin";

function App() {
    return (
        <AuthProvider>
            <BrowserRouter>
                <Routes>

                    <Route path="/" element={<Landing />} />
                    <Route path="/login" element={<Login />} />
                    <Route path="/signup" element={<Signup />} />
                    <Route path="/plans" element={<Plans />} />

                    <Route path="/dashboard" element={<Dashboard />} />
                    <Route path="/markets" element={<Markets />} />
                    <Route path="/portfolio" element={<Portfolio />} />
                    <Route path="/watchlist" element={<Watchlist />} />
                    <Route path="/kyc" element={<Kyc />} />
                    <Route path="/admin" element={<Admin />} />

                </Routes>
            </BrowserRouter>
        </AuthProvider>
    );
}

export default App;