import axios from 'axios';
import { apiUrl } from '../../utils/api';

const moduleApi = {
  fetchModules: async (req, res) => {
    const { courseId } = req.query;
    try {
      const response = await axios.get(`${apiUrl}courses/${courseId}/modules/`);
      res.status(200).json(response.data);
    } catch (error) {
      console.error('Failed to fetch modules:', error);
      res.status(500).json({ message: 'Failed to fetch modules.' });
    }
  },
  // Add other module-related endpoints
};

export default async (req, res) => {
  const { method, query } = req;

  if (method === 'GET' && query.courseId) {
    return moduleApi.fetchModules(req, res);
  } else {
    res.status(405).end(); // Method Not Allowed
  }
};