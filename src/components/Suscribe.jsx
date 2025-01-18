import { useState, useEffect } from "react";
import { Loader, CheckCircle, AlertCircle } from "lucide-react";
import { motion } from "framer-motion";
import axios from "axios";
import { toast } from 'react-toastify';

function SubscribeTopic({ credentials }) {
  const [topic, setTopic] = useState("");
  const [messages, setMessages] = useState([]);
  const [ws, setWs] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubscribe = async () => {
    setIsLoading(true);
    try {
      const response = await axios.post("http://localhost:4000/mqtt/suscribirse", {
        username: credentials.username,
        password: credentials.password,
        topic,
      });

      if (response.status === 200) {
        toast.success(response.data.message, { autoClose: 2000, closeOnClick: true, hideProgressBar: true });
      } else {
        toast.error(response.data.error, { autoClose: 2000, closeOnClick: true, hideProgressBar: true });
      }
    } catch (err) {
      toast.error('Error al suscribirse al topic', { autoClose: 2000, closeOnClick: true, hideProgressBar: true });
    } finally {
      setIsLoading(false);
    }
  };

  // Conectar al WebSocket para recibir mensajes
  useEffect(() => {
    const socket = new WebSocket("ws://127.0.0.1:4000");
    socket.onopen = () => {
      console.log("Conexión WebSocket establecida");
    };
    socket.onmessage = (event) => {
      const { topic: receivedTopic, message } = JSON.parse(event.data);
      if (receivedTopic === topic) {
        setMessages((prevMessages) => [...prevMessages, message]);
      }
    };
    setWs(socket);

    return () => {
      socket.close();
    };
  }, [topic]);

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="bg-white shadow-lg rounded-lg p-6 w-full max-w-md"
      >
        <h2 className="text-2xl font-semibold text-gray-800 flex items-center gap-2">
          <CheckCircle className="text-green-500" />
          Suscribirse a un Topic
        </h2>
        <div className="mt-4">
          <input
            type="text"
            placeholder="Topic"
            value={topic}
            onChange={(e) => setTopic(e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:outline-none"
          />
        </div>
        <button
          onClick={handleSubscribe}
          disabled={isLoading}
          className="mt-4 w-full flex items-center justify-center gap-2 px-4 py-2 bg-green-500 text-white font-semibold rounded-lg shadow hover:bg-green-600 transition duration-200 disabled:opacity-50"
        >
          {isLoading ? <Loader className="animate-spin" /> : <CheckCircle />}
          Suscribirse
        </button>
      </motion.div>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3, duration: 0.5 }}
        className="mt-8 w-full max-w-lg"
      >
        <h3 className="text-lg font-semibold text-gray-700">Mensajes recibidos:</h3>
        <ul className="mt-4 space-y-2">
          {messages.map((msg, index) => (
            <motion.li
              key={index}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.2 }}
              className="bg-gray-200 px-4 py-2 rounded-lg shadow"
            >
              {msg}
            </motion.li>
          ))}
        </ul>
      </motion.div>
    </div>
  );
}

export default SubscribeTopic;
