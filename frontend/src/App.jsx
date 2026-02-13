import React from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import "./responsive.css";
// Components
import TopBar from "./components/TopBar";
import WatchList from "./components/WatchList";
import Positions from "./components/Positions";

// Pages
import Dashboard from "./pages/Dashboard";
import Holdings from "./pages/Holdings";
import Orders from "./pages/Orders";
import Funds from "./pages/Funds";
import Account from "./pages/Account"; // <-- Import Account
import Login from "./pages/Login";
import Signup from "./pages/Signup";

function App() {
  const isAuthenticated = !!localStorage.getItem("token");

  return (
    <BrowserRouter>
      {/* ToastContainer must be here so it works across all pages */}
      <ToastContainer position="bottom-right" autoClose={2000} hideProgressBar={false} theme="colored" />
      
      {isAuthenticated && <TopBar />}
      
      <Routes>
        <Route path="/login" element={!isAuthenticated ? <Login /> : <Navigate to="/" />} />
        <Route path="/signup" element={!isAuthenticated ? <Signup /> : <Navigate to="/" />} />

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
                    <Route path="/account" element={<Account />} /> {/* <-- Add Account Route */}
                  </Routes>
                </div>
              </div>
            ) : (
              <Navigate to="/login" />
            )
          }
        />
      </Routes>
    </BrowserRouter>
  );
}

export default App;