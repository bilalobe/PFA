// front/src/api.js
import axios from 'axios';

const apiUrl = 'http://localhost:8000/api'; // Adresse de votre API

const getUsers = async () => {
  const response = await axios.get(`${apiUrl}/utilisateurs`);
  return response.data;
};



export { getUsers };