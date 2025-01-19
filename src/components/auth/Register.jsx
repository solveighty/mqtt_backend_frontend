import { useState } from "react";
import axios from "axios";
import { User, Lock } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { toast } from 'react-toastify';

function Register() {
  const navigate = useNavigate();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const handleRegister = async () => {
    setLoading(true);
    try {
      const response = await axios.post("http://localhost:4000/register", {
        username,
        password,
      });

      if (response.status === 201) {
        navigate("/login");
      } else {
        toast.success('Usuario registrado', { autoClose: 2000, closeOnClick: true, hideProgressBar: true });
        navigate("/login");
      }
    } catch (err) {
      toast.error('Error al registrar usuario', { autoClose: 2000, closeOnClick: true, hideProgressBar: true });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100">
      <div className="w-full max-w-sm p-6 bg-white shadow-lg rounded-lg animate-fade-in-down">
        <h1 className="text-2xl font-bold text-center text-gray-800 mb-6">
          Regístrate
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
            onClick={handleRegister}
            disabled={loading}
            className={`w-full py-2 text-white font-bold rounded-lg transition duration-300 ${
              loading
                ? "bg-blue-300 cursor-not-allowed"
                : "bg-green-500 hover:bg-green-600"
            }`}
          >
            {loading ? "Cargando..." : "Registrarse"}
          </button>
        </div>
        <p className="mt-4 text-center text-gray-600">
          ¿Ya tienes una cuenta?{" "}
          <span
            onClick={() => navigate("/login")}
            className="text-blue-500 hover:underline cursor-pointer"
          >
            Inicia sesión aquí
          </span>
        </p>
      </div>
    </div>
  );
}

export default Register;
