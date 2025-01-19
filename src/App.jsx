import { useState } from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import Login from "./components/auth/Login";
import PublishMessage from "./components/controllers/Publish";
import SubscribeTopic from "./components/controllers/Suscribe";
import Register from "./components/auth/Register";
import Navbar from "./components/Navbar";
import { ToastContainer } from 'react-toastify';
import "./App.css";
import Datos from "./components/controllers/Datos";

function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [credentials, setCredentials] = useState({ username: "", password: "" });

  return (
    <BrowserRouter>
      {isLoggedIn && <Navbar />}
      <Routes>
        <Route 
          path="/login" 
          element={
            !isLoggedIn ? (
              <Login setIsLoggedIn={setIsLoggedIn} setCredentials={setCredentials} />
            ) : (
              <Navigate to="/publish" />
            )
          } 
        />
        <Route 
          path="/publish" 
          element={
            isLoggedIn ? (
              <PublishMessage credentials={credentials} />
            ) : (
              <Navigate to="/login" />
            )
          } 
        />
        <Route 
          path="/suscribe" 
          element={
            isLoggedIn ? (
              <SubscribeTopic credentials={credentials} />
            ) : (
              <Navigate to="/login" />
            )
          } 
        />
        <Route 
          path="/datos" 
          element={
            isLoggedIn ? (
              <Datos credentials={credentials} />
            ) : (
              <Navigate to="/datos" />
            )
          } 
        />
        <Route path="/" element={<Navigate to="/login" />} />
        <Route path="/register" element={<Register />} />
      </Routes>
      <ToastContainer />
    </BrowserRouter>
  );
}

export default App;