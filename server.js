import express from "express"; // Framework para crear el servidor HTTP
import mysql from "mysql2/promise"; // Librería para interactuar con MySQL usando promesas
import mqtt from "mqtt"; // Librería para interactuar con el broker MQTT
import cors from "cors"; // Middleware para permitir solicitudes CORS desde un dominio específico
import crypto from "crypto"; // Módulo para generar hashes (se utiliza para encriptar contraseñas)
import WebSocket from "ws"; // Librería para WebSockets

// Inicialización de la aplicación Express
const app = express();
app.use(cors({ origin: "http://localhost:5173" })); // Permitir solicitudes CORS desde el frontend en localhost:5173
app.use(express.json()); // Middleware para procesar el cuerpo de las solicitudes en formato JSON

// Datos simulados de juegos y la cantidad de jugadores conectados
const games = [
  { game: "Zula", players: 0 },
  { game: "Grand Theft Auto V", players: 0 },
  { game: "Valorant", players: 0 },
  { game: "Horizon Forbidden West", players: 0 },
  { game: "Dragon City", players: 0 },
  { game: "Counter Strike 2", players: 0 },
  { game: "UNO", players: 0 },
  { game: "PVZ Garden Warfare", players: 0 },
  { game: "Dragon Ball Sparking Zero", players: 0 },
  { game: "Left 4 Dead 2", players: 0 },
];

// Función para simular la actualización de datos de jugadores conectados
function simulateData() {
  // Cambiar aleatoriamente la cantidad de jugadores en cada juego
  games.forEach((game) => {
    game.players = Math.floor(Math.random() * 5000); // Número aleatorio de jugadores entre 0 y 5000
  });

  return games;
}

// Configuración de conexión a la base de datos MySQL
const db = {
  host: "192.168.1.12", // Dirección IP del servidor MySQL
  user: "root", // Usuario de la base de datos
  password: "admin", // Contraseña de la base de datos
  database: "mqtt_user", // Nombre de la base de datos
};

// Configuración del cliente MQTT
const mqttHost = "192.168.1.12"; // Dirección IP del servidor MQTT
const mqttPort = 1883; // Puerto del servidor MQTT
const client = mqtt.connect(`mqtt://${mqttHost}:${mqttPort}`); // Conectar al broker MQTT

// Conexión MQTT global
let mqttClient = null;

// Publicar los datos simulados cada 7 segundos en el topic "/datos"
setInterval(() => {
  const simulatedData = simulateData(); // Obtener los datos simulados
  if (mqttClient && mqttClient.connected) {
    mqttClient.publish("/datos", JSON.stringify(simulatedData), (error) => {
      if (error) {
        console.error("Error al publicar datos:", error);
      } else {
        console.log("Datos simulados publicados:", simulatedData);
      }
    });
  }
}, 7000);

// Configuración del servidor WebSocket
const wss = new WebSocket.Server({ noServer: true });
let connectedClients = [];

// Manejo de conexiones WebSocket
wss.on("connection", (ws) => {
  console.log("Nuevo cliente WebSocket conectado");
  connectedClients.push(ws); // Agregar el cliente a la lista de clientes conectados

  ws.on("message", (message) => {
    console.log("Mensaje recibido:", message); // Log de los mensajes recibidos del cliente
  });

  ws.on("close", () => {
    console.log("Cliente WebSocket desconectado");
    connectedClients = connectedClients.filter((client) => client !== ws); // Eliminar el cliente desconectado de la lista
  });
});

// Inicializar el servidor HTTP y WebSocket
app.server = app.listen(4000, () => {
  console.log("Servidor HTTP y WebSocket corriendo en el puerto 4000");
});

// Manejo de actualizaciones WebSocket en caso de una conexión upgrade
app.server.on("upgrade", (request, socket, head) => {
  wss.handleUpgrade(request, socket, head, (ws) => {
    wss.emit("connection", ws, request);
  });
});

// Función para conectar el cliente MQTT
function connectMqtt(username, password) {
  mqttClient = mqtt.connect(`mqtt://${mqttHost}:${mqttPort}`, { username, password });

  mqttClient.on("connect", () => {
    console.log("Conexión al broker MQTT exitosa");

    // Escuchar mensajes de los topics a los que está suscrito
    mqttClient.on("message", (topic, message) => {
      console.log(`Mensaje recibido en ${topic}: ${message.toString()}`);

      // Enviar el mensaje a todos los clientes WebSocket conectados
      connectedClients.forEach((client) => {
        console.log("Enviando mensaje al cliente WebSocket...");
        client.send(JSON.stringify({ topic, message: message.toString() }));
      });
    });
  });

  mqttClient.on("error", (error) => {
    console.error("Error al conectar al broker MQTT:", error);
  });
}

// Endpoint para el login de los usuarios
app.post("/login", async (request, response) => {
  const { username, password } = request.body;

  try {
    // Generar un hash de la contraseña con un salt para mayor seguridad
    const salt = "salt";
    const passwordHash = crypto
      .createHash("sha256")
      .update(password + salt)
      .digest("hex");

    const connection = await mysql.createConnection(db); // Conexión a la base de datos
    const [rows] = await connection.execute(
      "SELECT * FROM mqtt_user WHERE username = ? AND password_hash = ?",
      [username, passwordHash]
    );
    connection.end();

    if (rows.length > 0) {
      response.json({ message: "Inicio de sesión con éxito" });
      // Conectar al cliente MQTT después del login exitoso
      connectMqtt(username, password);
    } else {
      response.status(401).json({ error: "Credenciales incorrectas" });
    }
  } catch (error) {
    response.status(500).json({ error: "Error al iniciar sesión" });
  }
});

// Endpoint para suscribirse a un topic MQTT
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

    // Suscribirse al topic en MQTT
    if (mqttClient && mqttClient.connected) {
      mqttClient.subscribe(topic, (error) => {
        if (error) {
          return response.status(500).json({ error: "Error al suscribirse al tópico" });
        }
        console.log(`Suscrito exitosamente al tópico: ${topic}`);
        response.json({ message: `Suscrito exitosamente al tópico: ${topic}` });
      });
    } else {
      response.status(500).json({ error: "No hay conexión MQTT activa" });
    }
  } catch (error) {
    console.error("Error al procesar la solicitud:", error);
    response.status(500).json({ error: "Error al procesar la solicitud" });
  }
});

// Endpoint para publicar un mensaje en un topic MQTT
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

    // Publicar el mensaje en el topic
    if (mqttClient && mqttClient.connected) {
      mqttClient.publish(topic, message, (error) => {
        if (error) {
          return response.status(500).json({ error: "Error al publicar el mensaje" });
        }
        response.json({ message: `Mensaje publicado en el topic: ${topic}` });
      });
    } else {
      response.status(500).json({ error: "No hay conexión MQTT activa" });
    }
  } catch (error) {
    response.status(500).json({ error: "Error al procesar la solicitud" });
  }
});

app.post("/register", async (request, response) => {
  const { username, password } = request.body;

  // Validar que los campos requeridos estén presentes
  if (!username || !password) {
    return response.status(400).json({ error: "El nombre de usuario y la contraseña son obligatorios" });
  }

  try {
    // Generar un hash de la contraseña con un salt
    const salt = "salt"; // Idealmente, usa un salt único para cada usuario
    const passwordHash = crypto
      .createHash("sha256")
      .update(password + salt)
      .digest("hex");

    const connection = await mysql.createConnection(db);

    // Insertar el nuevo usuario en la base de datos
    await connection.execute(
      "INSERT INTO mqtt_user (username, password_hash, salt, is_superuser, created) VALUES (?, ?, ?, ?, NOW())",
      [username, passwordHash, salt, 0] // `is_superuser` se configura como 0 (usuario normal por defecto)
    );

    connection.end();

    response.json({ message: "Usuario registrado con éxito" });
  } catch (error) {
    if (error.code === "ER_DUP_ENTRY") {
      response.status(409).json({ error: "El nombre de usuario ya está en uso" });
    } else {
      console.error("Error al registrar el usuario:", error);
      response.status(500).json({ error: "Error al registrar el usuario" });
    }
  }
});