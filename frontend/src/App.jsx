import React, { useContext } from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import "./responsive.css";
import NotificationListener from "./components/NotificationListener";
// Components
import TopBar from "./components/TopBar";
import WatchList from "./components/WatchList";
import Positions from "./components/Positions";

// Pages
import Dashboard from "./pages/Dashboard";
import Holdings from "./pages/Holdings";
import Orders from "./pages/Orders";
import Funds from "./pages/Funds";
import Account from "./pages/Account"; 
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import { UserContext } from "./context/UserContext";

function App() {
  const { isAuthenticated, loading } = useContext(UserContext);

  // 1. Prevent any rendering until we know if the user is logged in
  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', color: '#444' }}>
        Loading Kite...
      </div>
    );
  }

  return (
    <BrowserRouter>
    {isAuthenticated && <NotificationListener />}
      <ToastContainer position="bottom-right" autoClose={2000} hideProgressBar={false} theme="colored" />
      
      {/* 2. TopBar is ONLY visible when logged in */}
      {isAuthenticated && <TopBar />}
      
      <Routes>
        {/* --- PUBLIC ROUTES (Accessible only when logged OUT) --- */}
        {/* If a logged-in user tries to hit /login, force them to Dashboard */}
        <Route path="/login" element={!isAuthenticated ? <Login /> : <Navigate to="/" />} />
        <Route path="/signup" element={!isAuthenticated ? <Signup /> : <Navigate to="/" />} />

        {/* --- PROTECTED ROUTES (Accessible only when logged IN) --- */}
        <Route
          path="/*"
          element={
            isAuthenticated ? (
              <div className="app-container">
                <div className="watchlist-container">
                  <WatchList />
                </div>
                <div className="content-container">
                  <Routes>
                    <Route path="/" element={<Dashboard />} />
                    <Route path="/orders" element={<Orders />} />
                    <Route path="/holdings" element={<Holdings />} />
                    <Route path="/positions" element={<Positions />} />
                    <Route path="/funds" element={<Funds />} />
                    <Route path="/account" element={<Account />} /> 
                    {/* Catch-all for inside the app: Redirect unknown internal paths to Dashboard */}
                    <Route path="*" element={<Navigate to="/" />} />
                  </Routes>
                </div>
              </div>
            ) : (
              /* 3. The Gatekeeper: If not logged in, ANY attempt to access these pages sends you to Login */
              <Navigate to="/login" />
            )
          }
        />
      </Routes>
    </BrowserRouter>
  );
}

export default App;