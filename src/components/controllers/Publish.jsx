import { useState } from "react";
import { Send, Loader2 } from "lucide-react";
import axios from "axios";
import { motion } from "framer-motion";
import { toast } from 'react-toastify';

function PublishMessage({ credentials }) {
  const [topic, setTopic] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  const handlePublish = async () => {
    setLoading(true);
    try {
      const response = await axios.post("http://localhost:4000/mqtt/publicar", {
        username: credentials.username,
        password: credentials.password,
        topic,
        message,
      });

      if (response.status === 200) {
        toast.success(response.data.message, { autoClose: 2000, closeOnClick: true, hideProgressBar: true });
      } else {
        toast.error(response.data.error, { autoClose: 2000, closeOnClick: true, hideProgressBar: true });
      }
    } catch (err) {
      toast.error('Error al publicar el mensaje', { autoClose: 2000, closeOnClick: true, hideProgressBar: true });
    } finally {
      setLoading(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="flex flex-col items-center justify-center min-h-screen bg-gray-100 p-4"
    >
      <motion.div
        initial={{ y: 50, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.5, ease: "easeOut" }}
        className="bg-white shadow-lg rounded-lg p-6 w-full max-w-md"
      >
        <h2 className="text-2xl font-semibold text-gray-800 mb-4 text-center">
          Publicar en MQTT
        </h2>
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3, duration: 0.5 }}
          className="mb-4"
        >
          <input
            type="text"
            placeholder="Topic"
            value={topic}
            onChange={(e) => setTopic(e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg shadow-sm focus:ring-2 focus:ring-blue-500 focus:outline-none"
          />
        </motion.div>
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5, duration: 0.5 }}
          className="mb-4"
        >
          <input
            type="text"
            placeholder="Mensaje"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg shadow-sm focus:ring-2 focus:ring-blue-500 focus:outline-none"
          />
        </motion.div>
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={handlePublish}
          className="w-full flex items-center justify-center bg-blue-600 text-white font-semibold px-4 py-2 rounded-lg shadow-md hover:bg-blue-700"
          disabled={loading}
        >
          {loading ? (
            <>
              <Loader2 className="animate-spin mr-2" /> Publicando...
            </>
          ) : (
            <>
              <Send className="mr-2" /> Publicar
            </>
          )}
        </motion.button>
      </motion.div>
    </motion.div>
  );
}

export default PublishMessage;
