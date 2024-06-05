import { NextApiRequest, NextApiResponse } from 'next';
import axios from 'axios';
import { apiUrl } from '../../utils/api';

const resourceApi = {
  fetchResources: async (req, res) => {
    const { moduleId, searchQuery } = req.query;
    try {
      let url = `${apiUrl}resources/`;
      if (moduleId) {
        url += `?module=${moduleId}`;
      }
      if (searchQuery) {
        url += moduleId ? `&search=${searchQuery}` : `?search=${searchQuery}`;
      }
      const response = await axios.get(url);
      res.status(200).json(response.data);
    } catch (error) {
      console.error('Failed to fetch resources:', error);
      res.status(500).json({ message: 'Failed to fetch resources.' });
    }
  },
  uploadResource: async (req, res) => {
    try {
      const token = req.headers.authorization?.split(' ')[1];
      if (!token) {
        return res.status(401).json({ message: 'Authentication required.' });
      }
      const response = await axios.post(`${apiUrl}resources/`, req.body, {
        headers: {
          'Content-Type': 'multipart/form-data',
          Authorization: `Bearer ${token}`,
        },
      });
      res.status(201).json(response.data);
    } catch (error) {
      console.error('Failed to upload resource:', error);
      res.status(500).json({ message: 'Failed to upload resource.' });
    }
  },
  // Add other resource-related endpoints
};

export default async (req, res) => {
  const { method, query, body } = req;

  if (method === 'GET') {
    if (query.moduleId && query.searchQuery) {
      return resourceApi.fetchResources(req, res);
    } else {
      res.status(405).end(); // Method Not Allowed
    }
  } else if (method === 'POST' && req.headers.authorization) {
    return resourceApi.uploadResource(req, res);
  } else {
    res.status(405).end(); 
  }
};