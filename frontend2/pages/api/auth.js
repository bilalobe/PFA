import axios from 'axios';
import { apiUrl } from '../../utils/api';

const authApi = {
    login: async (req, res) => {
        if (req.method === 'POST') {
            try {
                const { username, password } = req.body;
                const response = await axios.post(`${apiUrl}auth/token/`, { username, password });
                res.status(200).json(response.data);
            } catch (error) {
                console.error('Login failed:', error);
                res.status(401).json({ message: 'Invalid credentials.' });
            }
        } else {
            res.status(405).end();
        }
    },
    register: async (req, res) => {
        if (req.method === 'POST') {
            try {
                const { username, email, password, userType } = req.body;
                const response = await axios.post(`${apiUrl}auth/register/`, {
                    username,
                    email,
                    password,
                    profile: { user_type: userType },
                });
                res.status(201).json(response.data);
            } catch (error) {
                console.error('Registration failed:', error);
                res.status(400).json({ message: 'Registration failed.' });
            }
        } else {
            res.status(405).end();
        }
    },
    refreshToken: async (req, res) => {
        if (req.method === 'POST') {
            try {
                const { refreshToken } = req.body;
                const response = await axios.post(`${apiUrl}auth/token/refresh/`, {
                    refresh: refreshToken,
                });
                res.status(200).json(response.data);
            } catch (error) {
                console.error('Refresh token failed:', error);
                res.status(401).json({ message: 'Invalid refresh token.' });
            }
        } else {
            res.status(405).end();
        }
    },
    logout: async (req, res) => {
        if (req.method === 'POST') {
            try {
                const { refreshToken } = req.body;
                const response = await axios.post(`${apiUrl}auth/logout/`, {
                    refresh: refreshToken,
                });
                res.status(200).json(response.data);
            } catch (error) {
                console.error('Logout failed:', error);
                res.status(401).json({ message: 'Invalid refresh token.' });
            }
        } else {
            res.status(405).end();
        }
    },
};

export default async (req, res) => {
    const { method } = req;

    if (method === 'POST' && req.body.username && req.body.password) {
        return authApi.login(req, res);
    } else if (method === 'POST' && req.body.username && req.body.email && req.body.password && req.body.userType) {
        return authApi.register(req, res);
    } else if (method === 'POST' && req.body.refreshToken) {
        return authApi.refreshToken(req, res);
    } else {
        res.status(405).end(); // Method Not Allowed
    }
};