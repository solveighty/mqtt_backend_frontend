import { useState } from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import Login from "./components/Login";
import PublishMessage from "./components/Publish";
import SubscribeTopic from "./components/Suscribe";
import Navbar from "./components/Navbar";
import { ToastContainer } from 'react-toastify';
import "./App.css";

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
        <Route path="/" element={<Navigate to="/login" />} />
      </Routes>
      <ToastContainer />
    </BrowserRouter>
  );
}

export default App;