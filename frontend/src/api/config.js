import axios from 'axios';

const API_BASE_URL = 'http://localhost:8080'; // Backend URL

const api = axios.create({
    baseURL: API_BASE_URL,
    headers: {
        'Content-Type': 'application/json',
    },
    withCredentials: true
});

export default api; 