import axios from 'axios';

const axiosInstance = axios.create({
  baseURL: '/api', // Base de las rutas de tu API
  timeout: 5000, // Tiempo máximo de espera
  headers: {
    'Content-Type': 'application/json',
  },
});

export default axiosInstance;
