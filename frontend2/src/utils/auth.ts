import axios from 'axios';
import { apiUrl } from '../../utils/api.ts';

// Function to get a new access token using refresh token
const getNewToken = (refreshToken: string) => {
    return axios.post(`${apiUrl}auth/token/refresh/`, {
        refresh: refreshToken,
    });
};

// Request interceptor to check if token is about to expire
axios.interceptors.request.use(async (config) => {
    const { accessToken, refreshToken } = config.headers;

    // Check if token is about to expire
    if ( accessToken && refreshToken) {
        const response = await getNewToken(refreshToken);
        config.headers['accessToken'] = response.data.access;
    }

    return config;
}, (error) => {
    return Promise.reject(error);
});

// Response interceptor to handle expired tokens
axios.interceptors.response.use((response) => {
    return response;
}, async (error) => {
    const originalRequest = error.config;
    if (error.response.status === 401 && !originalRequest._retry) {
        originalRequest._retry = true;
        const refreshToken = 'YOUR_REFRESH_TOKEN'; // Replace 'YOUR_REFRESH_TOKEN' with the actual refresh token value
        const response = await getNewToken(refreshToken);
        originalRequest.headers['accessToken'] = response.data.access;
        return axios(originalRequest);
    }

    return Promise.reject(error);
});

const authApi = {

    login: async (req: { method: string; body: { username: any; password: any; }; }, res: { status: (arg0: number) => { (): any; new(): any; json: { (arg0: { message: string; }): void; new(): any; }; end: { (): void; new(): any; }; }; }) => {
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
    register: async (req: { method: string; body: { username: any; email: any; password: any; userType: any; }; }, res: { status: (arg0: number) => { (): any; new(): any; json: { (arg0: { message: string; }): void; new(): any; }; end: { (): void; new(): any; }; }; }) => {
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
    refreshToken: async (req: { method: string; body: { refreshToken: any; }; }, res: { status: (arg0: number) => { (): any; new(): any; json: { (arg0: { message: string; }): void; new(): any; }; end: { (): void; new(): any; }; }; }) => {
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
    logout: async (req: { method: string; body: { refreshToken: any; }; }, res: { status: (arg0: number) => { (): any; new(): any; json: { (arg0: { message: string; }): void; new(): any; }; end: { (): void; new(): any; }; }; }) => {
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

export default async (req: { body?: any; method?: any; }, res: { status: (arg0: number) => { (): any; new(): any; json: { (arg0: { message: string; }): void; new(): any; }; end: { (): void; new(): any; }; }; }) => {
    const { method } = req;
    console.log('method', method);

    if (method === 'POST' && req.body.username && req.body.password) {
        return authApi.login({ method: method, body: req.body }, res);
    } else if (method === 'POST' && req.body.username && req.body.email && req.body.password && req.body.userType) {
        return authApi.register({ method: method, body: req.body }, res);
    } else if (method === 'POST' && req.body.refreshToken) {
        return authApi.refreshToken({ method: method, body: req.body }, res);
    } else {
        res.status(405).end(); // Method Not Allowed
    }
};