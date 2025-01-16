import express from "express";
import mysql from "mysql2/promise";
import mqtt from "mqtt";
import cors from "cors";
import crypto from "crypto";

const app = express();
app.use(cors({ origin: "http://localhost:5173"}));
app.use(express.json());

const db = {
  host: "192.168.1.12",
  user: "root",
  password: "admin",
  database: "mqtt_user",
};

const mqttHost = "192.168.1.12";
const mqttPort = 1883;

app.post("/login", async (request, response) => {
  const { username, password } = request.body;

  try {
    const salt = "salt";
    const passwordHash = crypto
      .createHash("sha256")
      .update(password + salt)
      .digest("hex");

    const connection = await mysql.createConnection(db);
    const [rows] = await connection.execute(
      "SELECT * FROM mqtt_user WHERE username = ? AND password_hash = ?",
      [username, passwordHash]
    );
    connection.end();

    if (rows.length > 0) {
      response.json({ message: "Inicio de sesion con exito" });
    } else {
      response.status(401).json({ error: "Credenciales incorrectas" });
    }
  } catch (error) {
    response.status(500).json({ error: "Error al iniciar sesion" });
  }
});

app.post("/mqtt/publicar", async (request, response) => {
  const { username, password, topic, message } = request.body;

  try {
    const salt = "salt";
    const passwordHash = crypto
      .createHash("sha256")
      .update(password + salt)
      .digest("hex");

    const connection = await mysql.createConnection(db);
    const [rows] = await connection.execute(
      "SELECT * FROM mqtt_user WHERE username = ? AND password_hash = ?",
      [username, passwordHash]
    );
    connection.end();

    if (rows.length === 0) {
      return response.status(401).json({ error: "Credenciales incorrectas" });
    }

    const client = mqtt.connect(`mqtt://${mqttHost}:${mqttPort}`, {
      username,
      password,
    });

    client.on("connect", () => {
      client.publish(topic, message, (error) => {
        client.end();
        if (error) {
          return response
            .status(500)
            .json({ error: "Error al publicar el mensaje" });
        }
        response.json({ message: `Mensaje publicado en el topic: ${topic}` });
      });
    });

    client.on("error", (error) => {
      response.status(500).json({ error: "Error al conectar al broket" });
    });
  } catch (error) {
    response.status(500).json({ error: "Error al procesar la solicitud" });
  }
});

app.listen(4000, () => {
  console.log("Servidor corriento en el puerto 4000");
});
