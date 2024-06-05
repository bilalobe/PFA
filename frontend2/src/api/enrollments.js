import axios from 'axios';
import { apiUrl } from '../../utils/api';

const enrollmentApi = {
  fetchEnrollments: async (req, res) => {
    try {
      const token = req.headers.authorization?.split(' ')[1];
      if (!token) {
        return res.status(401).json({ message: 'Authentication required.' });
      }
      const response = await axios.get(`${apiUrl}enrollments/`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      res.status(200).json(response.data);
    } catch (error) {
      console.error('Failed to fetch enrollments:', error);
      res.status(500).json({ message: 'Failed to fetch enrollments.' });
    }
  },
  enrollInCourse: async (req, res) => {
    const { courseId } = req.body;
    try {
      const token = req.headers.authorization?.split(' ')[1];
      if (!token) {
        return res.status(401).json({ message: 'Authentication required.' });
      }
      const response = await axios.post(`${apiUrl}enrollments/`, { course: courseId }, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      res.status(201).json(response.data);
    } catch (error) {
      console.error('Failed to enroll in course:', error);
      res.status(500).json({ message: 'Failed to enroll in course.' });
    }
  },
  fetchUnenroll: async (req, res) => {
    const { courseId } = req.query;
    try {
      const token = req.headers.authorization?.split(' ')[1];
      if (!token) {
        return res.status(401).json({ message: 'Authentication required.' });
      }
      await axios.delete(`${apiUrl}enrollments/${courseId}/`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      res.status(204).end(); // No content
    } catch (error) {
      console.error('Failed to unenroll from course:', error);
      res.status(500).json({ message: 'Failed to unenroll from course.' });
    }
  },
  updateProgress: async (req, res) => {
    const { enrollmentId, progress } = req.body;
    try {
      const token = req.headers.authorization?.split(' ')[1];
      if (!token) {
        return res.status(401).json({ message: 'Authentication required.' });
      }
      const response = await axios.put(`${apiUrl}enrollments/${enrollmentId}/`, { progress }, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      res.status(200).json(response.data);
    } catch (error) {
      console.error('Failed to update progress:', error);
      res.status(500).json({ message: 'Failed to update progress.' });
    }
  },
};

export default async (req, res) => {
  const { method, query, body } = req;

  if (method === 'GET' && req.headers.authorization) {
    return enrollmentApi.fetchEnrollments(req, res);
  } else if (method === 'POST' && req.headers.authorization && body.courseId) {
    return enrollmentApi.enrollInCourse(req, res);
  } else if (method === 'DELETE' && req.headers.authorization && query.courseId) {
    return enrollmentApi.fetchUnenroll(req, res);
  } else if (method === 'PUT' && req.headers.authorization && body.enrollmentId && body.progress) {
    return enrollmentApi.updateProgress(req, res);
  } else {
    res.status(405).end();
  }
};