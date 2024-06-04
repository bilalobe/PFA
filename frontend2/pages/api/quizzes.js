import { NextApiRequest, NextApiResponse } from 'next';
import axios from 'axios';
import { apiUrl } from '../../utils/api';

const quizApi = {
  fetchQuiz: async (req, res) => {
    const { quizId } = req.query;
    try {
      const response = await axios.get(`${apiUrl}quizzes/${quizId}/`);
      res.status(200).json(response.data);
    } catch (error) {
      console.error('Failed to fetch quiz:', error);
      res.status(500).json({ message: 'Failed to fetch quiz.' });
    }
  },
  submitQuiz: async (req, res) => {
    const { quizId } = req.query;
    const { choices } = req.body;
    try {
      const token = req.headers.authorization?.split(' ')[1];
      if (!token) {
        return res.status(401).json({ message: 'Authentication required.' });
      }
      const response = await axios.post(`${apiUrl}quizzes/${quizId}/attempts/`, { choices }, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      res.status(200).json(response.data);
    } catch (error) {
      console.error('Failed to submit quiz:', error);
      res.status(500).json({ message: 'Failed to submit quiz.' });
    }
  },
  // Add other quiz-related endpoints
};

export default async (req, res) => {
  const { method, query, body } = req;

  if (method === 'GET' && query.quizId) {
    return quizApi.fetchQuiz(req, res);
  } else if (method === 'POST' && query.quizId && req.body.choices) {
    return quizApi.submitQuiz(req, res);
  } else {
    res.status(405).end();
  }
};