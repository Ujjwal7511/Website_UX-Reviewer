import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import { useState, useEffect } from "react";

import Home from "./pages/Home";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import Status from "./pages/Status";
import Review from "./pages/Review";
import { isAuthenticated, logout, getCurrentUser } from "./services/api";

function App() {
  const [auth, setAuth] = useState({
    isAuthenticated: false,
    user: null
  });

  useEffect(() => {
    // Check auth status on mount
    const token = localStorage.getItem('token');
    const user = getCurrentUser();
    setAuth({
      isAuthenticated: !!token,
      user
    });
  }, []);

  const handleLogout = () => {
    logout();
    setAuth({
      isAuthenticated: false,
      user: null
    });
  };

  return (
    <Router>
      <Routes>
        <Route path="/login" element={<Login />} />
        
        <Route path="/signup" element={<Signup />} />

        <Route path="/" element={<Home />} />

        <Route path="/home" element={<Home />} />

        <Route path="/status" element={<Status />} />

        <Route 
          path="/review" 
          element={localStorage.getItem('token') ? <Review /> : <Navigate to="/login" />} 
        />

        <Route path="*" element={<Home />} />
      </Routes>
    </Router>
  );
}

export default App;
