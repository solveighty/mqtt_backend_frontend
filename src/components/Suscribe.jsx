import { useState, useEffect } from "react";

function SubscribeTopic({ credentials }) {
  const [topic, setTopic] = useState("");
  const [messages, setMessages] = useState([]);
  const [ws, setWs] = useState(null);

  const handleSubscribe = async () => {
    try {
      const response = await fetch("http://localhost:4000/mqtt/suscribirse", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          username: credentials.username,
          password: credentials.password,
          topic,
        }),
      });

      const data = await response.json();
      if (response.ok) {
        alert(data.message);
      } else {
        alert(data.error);
      }
    } catch (err) {
      alert("Error al suscribirse al topic.");
    }
  };

  // Conectar al WebSocket para recibir mensajes
  useEffect(() => {
    const socket = new WebSocket("ws://127.0.0.1:4000");
    socket.onopen = () => {
      console.log("Conexión WebSocket establecida");
    };
    socket.onmessage = (event) => {
      const { topic, message } = JSON.parse(event.data);
      if (topic === topic) {
        setMessages((prevMessages) => [...prevMessages, message]);
      }
    };
    setWs(socket);

    return () => {
      socket.close();
    };
  }, [topic]);

  return (
    <div>
      <h2>Suscribirse a un Topic</h2>
      <input
        type="text"
        placeholder="Topic"
        value={topic}
        onChange={(e) => setTopic(e.target.value)}
      />
      <button onClick={handleSubscribe}>Suscribirse</button>
      <div>
        <h3>Mensajes recibidos:</h3>
        <ul>
          {messages.map((msg, index) => (
            <li key={index}>{msg}</li>
          ))}
        </ul>
      </div>
    </div>
  );
}

export default SubscribeTopic;
