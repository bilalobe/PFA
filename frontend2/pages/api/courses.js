import { NextApiRequest, NextApiResponse } from 'next';
import axios from 'axios';
import { apiUrl } from '../../utils/api';

const courseApi = {
  fetchCourses: async (req, res) => {
    try {
      const response = await axios.get(`${apiUrl}courses/`);
      res.status(200).json(response.data);
    } catch (error) {
      console.error('Failed to fetch courses:', error);
      res.status(500).json({ message: 'Failed to fetch courses.' });
    }
  },
  fetchCourseDetails: async (req, res) => {
    const { courseId } = req.query;
    try {
      const response = await axios.get(`${apiUrl}courses/${courseId}/`);
      res.status(200).json(response.data);
    } catch (error) {
      console.error('Failed to fetch course details:', error);
      res.status(500).json({ message: 'Failed to fetch course details.' });
    }
  },
  // Add other course-related endpoints
};

export default async (req, res) => {
  const { method, query } = req;

  if (method === 'GET') {
    if (query.courseId) {
      return courseApi.fetchCourseDetails(req, res);
    } else {
      return courseApi.fetchCourses(req, res);
    }
  } else {
    res.status(405).end(); // Method Not Allowed
  }
};