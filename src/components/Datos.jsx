import React, { useState, useEffect } from 'react';
import { Line } from 'react-chartjs-2';
import { Chart as ChartJS, Title, Tooltip, Legend, LineElement, CategoryScale, LinearScale, PointElement } from 'chart.js';

// Configuración de ChartJS
ChartJS.register(Title, Tooltip, Legend, LineElement, CategoryScale, LinearScale, PointElement);

export default function Datos() {
  const [data, setData] = useState([]);
  
  useEffect(() => {
    const socket = new WebSocket('ws://127.0.0.1:4000');
    
    socket.onopen = () => {
      console.log('Conexión WebSocket abierta');
    };
    
    socket.onmessage = (event) => {
      try {
        const parsedData = JSON.parse(event.data);
        
        // Verificamos que 'message' contiene un string JSON que podemos parsear
        const messageData = JSON.parse(parsedData.message);
        
        // Asegurarnos de que messageData es un array
        if (Array.isArray(messageData)) {
          setData(messageData);
        } else {
          console.error('Datos recibidos no son un array:', messageData);
        }
      } catch (error) {
        console.error('Error al parsear los datos:', error);
      }
    };
    
    socket.onerror = (error) => {
      console.error('Error en la conexión WebSocket:', error);
    };
    
    socket.onclose = () => {
      console.log('Conexión WebSocket cerrada');
    };
    
    // Limpiar la conexión cuando el componente se desmonte
    return () => {
      socket.close();
    };
  }, []);

  // Configuración del gráfico con los datos recibidos
  const chartData = {
    labels: data.map(item => item.game), // Usamos los nombres de los juegos como etiquetas
    datasets: [
      {
        label: 'Jugadores',
        data: data.map(item => item.players), // Usamos el número de jugadores
        borderColor: 'rgba(75,192,192,1)',
        backgroundColor: 'rgba(75,192,192,0.2)',
        pointStyle: 'circle', // Estilo de los puntos
        pointRadius: 5, // Tamaño de los puntos
        fill: false,
      },
    ],
  };

  return (
    <div>
      <h2>Datos Simulados</h2>
      {data.length > 0 ? (
        <Line data={chartData} />
      ) : (
        <p>Cargando datos...</p>
      )}
    </div>
  );
}
