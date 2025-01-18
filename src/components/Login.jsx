import { useState } from "react";
import axios from "axios";
import { User, Lock } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { toast } from 'react-toastify';

function Login({ setIsLoggedIn, setCredentials }) {
  const navigate = useNavigate();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {
    setLoading(true);
    try {
      const response = await axios.post("http://localhost:4000/login", {
        username,
        password,
      });

      if (response.status === 200) {
        setIsLoggedIn(true);
        setCredentials({ username, password });
        navigate("/publish");
        toast.success('Inicio de sesión exitoso', { autoClose: 2000, closeOnClick: true, hideProgressBar: true });
      } else {
        toast.error('Credenciales incorrectas', { autoClose: 2000, closeOnClick: true, hideProgressBar: true });
      }
    } catch (err) {
      toast.error('Error al iniciar sesión', { autoClose: 2000, closeOnClick: true, hideProgressBar: true });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100">
      <div className="w-full max-w-sm p-6 bg-white shadow-lg rounded-lg animate-fade-in-down">
        <h1 className="text-2xl font-bold text-center text-gray-800 mb-6">
          Iniciar Sesión
        </h1>
        <div className="space-y-4">
          <div className="relative">
            <User className="absolute top-1/2 left-3 transform -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Usuario"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent"
            />
          </div>
          <div className="relative">
            <Lock className="absolute top-1/2 left-3 transform -translate-y-1/2 text-gray-400" />
            <input
              type="password"
              placeholder="Contraseña"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent"
            />
          </div>
          <button
            onClick={handleLogin}
            disabled={loading}
            className={`w-full py-2 text-white font-bold rounded-lg transition duration-300 ${
              loading
                ? "bg-blue-300 cursor-not-allowed"
                : "bg-blue-500 hover:bg-blue-600"
            }`}
          >
            {loading ? "Cargando..." : "Iniciar Sesión"}
          </button>
        </div>
      </div>
    </div>
  );
}

export default Login;
