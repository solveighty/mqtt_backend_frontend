import { useState } from "react";

function Login({ setIsLoggedIn, setCredentials }) {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");

  const handleLogin = async () => {
    try {
      const response = await fetch("http://localhost:4000/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password }),
      });

      if (response.ok) {
        setIsLoggedIn(true);
        setCredentials({ username, password });
        alert("Inicio de sesión exitoso");
      } else {
        alert("Credenciales incorrectas");
      }
    } catch (err) {
      alert("Error al iniciar sesión.");
    }
  };

  return (
    <div>
      <h1>Login</h1>
      <input
        type="text"
        placeholder="Usuario"
        value={username}
        onChange={(e) => setUsername(e.target.value)}
      />
      <input
        type="password"
        placeholder="Contraseña"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
      />
      <button onClick={handleLogin}>Iniciar Sesión</button>
    </div>
  );
}

export default Login;
