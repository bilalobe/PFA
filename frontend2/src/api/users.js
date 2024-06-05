import { NextApiRequest, NextApiResponse } from 'next';
import axios from 'axios';
import { apiUrl } from '../../utils/api';

const userApi = {
  getProfile: async (req, res) => {
    try {
      const token = req.headers.authorization?.split(' ')[1];
      if (!token) {
        return res.status(401).json({ message: 'Authentication required.' });
      }
      const response = await axios.get(`${apiUrl}users/me/`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      res.status(200).json(response.data);
    } catch (error) {
      console.error('Failed to get profile:', error);
      res.status(500).json({ message: 'Failed to get profile.' });
    }
  },
  updateProfile: async (req, res) => {
    try {
      const token = req.headers.authorization?.split(' ')[1];
      if (!token) {
        return res.status(401).json({ message: 'Authentication required.' });
      }
      const response = await axios.put(`${apiUrl}users/me/`, req.body, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      res.status(200).json(response.data);
    } catch (error) {
      console.error('Failed to update profile:', error);
      res.status(500).json({ message: 'Failed to update profile.' });
    }
  },
};

export default async (req, res) => {
  const { method } = req;

  if (method === 'GET' && req.headers.authorization) {
    return userApi.getProfile(req, res);
  } else if (method === 'PUT' && req.headers.authorization) {
    return userApi.updateProfile(req, res);
  } else {
    res.status(405).end();
  }
};