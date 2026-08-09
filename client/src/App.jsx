import { BrowserRouter, Routes, Route } from "react-router-dom";

import Login from "./pages/login";
import SignUp from "./pages/signup";
import ForgotPassword from "./pages/forgot-password";
import Profile from "./pages/profile";
import Requirements from "./pages/req";
import Team from "./pages/team";
import SeedViewer from "./pages/seed-viewer";

import MainLayout from "./layouts/MainLayout";
import AuthLayout from "./layouts/LgLayout";

import { Navigate } from "react-router-dom";

function AdminRoute({ children }) {
    try {
        const stored = localStorage.getItem('currentUser');
        if (stored) {
            const u = JSON.parse(stored);
            if (u && u.username === 'admin') {
                return children;
            }
        }
    } catch {}
    return <Navigate to="/profile" replace />;
}

function App() {
    return (
        <BrowserRouter>
            <Routes>
                {/* Auth pages */}
                <Route element={<AuthLayout />}>
                    <Route path="/" element={<Login />} />
                    <Route path="/signup" element={<SignUp />} />
                    <Route path="/forgot-password" element={<ForgotPassword />} />
                </Route>

                {/* Authenticated pages with SideNav */}
                <Route element={<MainLayout />}>
                    <Route path="/profile" element={<Profile />} />
                    <Route path="/requirements" element={<Requirements />} />
                    <Route path="/team" element={<Team />} />
                    <Route path="/dev/seed-viewer" element={
                        <AdminRoute>
                            <SeedViewer />
                        </AdminRoute>
                    } />
                </Route>
            </Routes>
        </BrowserRouter>
    );
}

export default App;
