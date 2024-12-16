import axios from 'axios';

const axiosInstance = axios.create({
  baseURL: 'https://your-supabase-api-url.supabase.co',
  headers: {
    'Content-Type': 'application/json',
  },
});

export default axiosInstance;
