import { useState } from "react";

function PublishMessage({ credentials }) {
  const [topic, setTopic] = useState("");
  const [message, setMessage] = useState("");

  const handlePublish = async () => {
    try {
      const response = await fetch("http://localhost:4000/mqtt/publicar", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          username: credentials.username,
          password: credentials.password,
          topic,
          message,
        }),
      });

      const data = await response.json();
      if (response.ok) {
        alert(data.message);
      } else {
        alert(data.error);
      }
    } catch (err) {
      alert("Error al publicar el mensaje.");
    }
  };

  return (
    <div>
      <h2>Publicar en MQTT</h2>
      <input
        type="text"
        placeholder="Topic"
        value={topic}
        onChange={(e) => setTopic(e.target.value)}
      />
      <input
        type="text"
        placeholder="Mensaje"
        value={message}
        onChange={(e) => setMessage(e.target.value)}
      />
      <button onClick={handlePublish}>Publicar</button>
    </div>
  );
}

export default PublishMessage;
