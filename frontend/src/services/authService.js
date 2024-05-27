// src/services/authService.js
import axios from 'axios';

const API_URL = '/api/auth/';

const register = (username, email, password) => {
    return axios.post(API_URL + 'registration/', {
        username,
        email,
        password
    });
};

const login = (username, password) => {
    return axios.post(API_URL + 'login/', {
        username,
        password
    }).then(response => {
        if (response.data.key) {
            localStorage.setItem('user', JSON.stringify(response.data));
        }
        return response.data;
    });
};

const logout = () => {
    localStorage.removeItem('user');
};

export default {
    register,
    login,
    logout,
};
