import axios from 'axios';
import { apiUrl } from '../../utils/api';

const forumApi = {
  fetchForumPosts: async (req, res) => {
    const { courseId } = req.query;
    try {
      const response = await axios.get(`${apiUrl}courses/${courseId}/forums/`);
      res.status(200).json(response.data);
    } catch (error) {
      console.error('Failed to fetch forum posts:', error);
      res.status(500).json({ message: 'Failed to fetch forum posts.' });
    }
  },
  createForumPost: async (req, res) => {
    const { courseId, title, content } = req.body;
    try {
      const token = req.headers.authorization?.split(' ')[1];
      if (!token) {
        return res.status(401).json({ message: 'Authentication required.' });
      }
      const response = await axios.post(`${apiUrl}courses/${courseId}/forums/threads/`, { title, content }, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      res.status(201).json(response.data);
    } catch (error) {
      console.error('Failed to create forum post:', error);
      res.status(500).json({ message: 'Failed to create forum post.' });
    }
  },
  reportPost: async (req, res) => {
    const { postId, reason } = req.body;
    try {
      const token = req.headers.authorization?.split(' ')[1];
      if (!token) {
        return res.status(401).json({ message: 'Authentication required.' });
      }
      const response = await axios.post(`${apiUrl}moderate/`, { postId, reason }, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      res.status(201).json(response.data);
    } catch (error) {
      console.error('Failed to report post:', error);
      res.status(500).json({ message: 'Failed to report post.' });
    }
  },
  // Add other forum-related endpoints
};

export default async (req, res) => {
  const { method, query, body } = req;

  if (method === 'GET' && query.courseId) {
    return forumApi.fetchForumPosts(req, res);
  } else if (method === 'POST' && body.courseId && body.title && body.content) {
    return forumApi.createForumPost(req, res);
  } else if (method === 'POST' && body.postId && body.reason) {
    return forumApi.reportPost(req, res);
  } else {
    res.status(405).end(); // Method Not Allowed
  }
};