import axios from 'axios';
import { apiUrl } from './api'; // Correct the path to your api.js file

export default async (req, res) => {
  const { forumId } = req.query;

  if (req.method === 'POST') {
    try {
      const token = req.headers.authorization?.split(' ')[1];
      if (!token) {
        return res.status(401).json({ message: 'Authentication required.' });
      }

      const response = await axios.post(`${apiUrl}/forums/${forumId}/threads/`, req.body, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      res.status(201).json(response.data);
    } catch (error) {
      console.error('Error creating thread:', error);
      res.status(500).json({ message: 'Failed to create thread.' });
    }
  } else {
    res.status(405).end(); // Method Not Allowed
  }
};