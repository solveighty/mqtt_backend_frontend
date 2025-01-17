import { useState } from "react";
import Login from "./components/Login";
import PublishMessage from "./components/Publish";
import SubscribeTopic from "./components/Suscribe";
import "./App.css";

function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [credentials, setCredentials] = useState({ username: "", password: "" });

  return (
    <div>
      {!isLoggedIn ? (
        <Login setIsLoggedIn={setIsLoggedIn} setCredentials={setCredentials} />
      ) : (
        <div>
          <h1>Panel MQTT</h1>
          <PublishMessage credentials={credentials} />
          <SubscribeTopic credentials={credentials} />
        </div>
      )}
    </div>
  );
}

export default App;