import express from "express";
import mysql from "mysql2/promise";
import mqtt from "mqtt";
import cors from "cors";
import crypto from "crypto";
import WebSocket from "ws";

const app = express();
app.use(cors({ origin: "http://localhost:5173"}));
app.use(express.json());

const games = [
  { game: "Juego 1", players: 0 },
  { game: "Juego 2", players: 0 },
  { game: "Juego 3", players: 0 },
  { game: "Juego 4", players: 0 },
  { game: "Juego 5", players: 0 },
];

// Función para actualizar los datos de jugadores conectados
function simulateData() {
  // Cambiar aleatoriamente la cantidad de jugadores en cada juego
  games.forEach((game) => {
    game.players = Math.floor(Math.random() * 100); // Número aleatorio de jugadores entre 0 y 100
  });

  return games;
}

const db = {
  host: "192.168.1.12",
  user: "root",
  password: "admin",
  database: "mqtt_user",
};

const mqttHost = "192.168.1.12";
const mqttPort = 1883;
const client = mqtt.connect(`mqtt://${mqttHost}:${mqttPort}`);

// Publicar los datos simulados cada 2 segundos
setInterval(() => {
  const simulatedData = simulateData();
  client.publish("/datos", JSON.stringify(simulatedData), (error) => {
    if (error) {
      console.error("Error al publicar datos:", error);
    }
  });
  console.log("Datos publicados:", simulatedData);
}, 2000);

const wss = new WebSocket.Server({ noServer: true });
let connectedClients = [];

wss.on("connection", (ws) => {
  console.log("Nuevo cliente conectado");
  connectedClients.push(ws);

  ws.on("message", (message) => {
    console.log("Mensaje recibido:", message);
  });

  ws.on("close", () => {
    console.log("Cliente desconectado");
    connectedClients = connectedClients.filter((client) => client !== ws);
  });
});

app.server = app.listen(4000, () => {
  console.log("Servidor HTTP y WebSocket corriendo en el puerto 4000");
});

app.server.on("upgrade", (request, socket, head) => {
  wss.handleUpgrade(request, socket, head, (ws) => {
    wss.emit("connection", ws, request);
  });
});


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

app.post("/mqtt/suscribirse", async (request, response) => {
  const { username, password, topic } = request.body;

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

    // Verificar si ya existe un cliente MQTT conectado
    if (!global.mqttClient) {
      global.mqttClient = mqtt.connect(`mqtt://${mqttHost}:${mqttPort}`, {
        username,
        password,
      });

      global.mqttClient.on("connect", () => {
        console.log("Conexión al broker MQTT exitosa");

        // Escuchar mensajes del broker
        global.mqttClient.on("message", (receivedTopic, message) => {
          console.log(`Mensaje recibido en ${receivedTopic}: ${message.toString()}`);

          // Enviar el mensaje a todos los clientes WebSocket conectados
          connectedClients.forEach((client) => {
            console.log("Enviando mensaje al cliente WebSocket...");
            client.send(JSON.stringify({ topic: receivedTopic, message: message.toString() }));
          });
        });
      });

      global.mqttClient.on("error", (error) => {
        console.error("Error al conectar al broker MQTT:", error);
      });
    }

    // Suscribirse al tópico
    global.mqttClient.subscribe(topic, (error) => {
      if (error) {
        return response.status(500).json({ error: "Error al suscribirse al tópico" });
      }
      console.log(`Suscrito exitosamente al tópico: ${topic}`);
      response.json({ message: `Suscrito exitosamente al tópico: ${topic}` });
    });
  } catch (error) {
    console.error("Error al procesar la solicitud:", error);
    response.status(500).json({ error: "Error al procesar la solicitud" });
  }
});
