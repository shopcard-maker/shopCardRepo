import axios from 'axios'

const adminApi = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'https://shopcard-backend.onrender.com/api'
})

adminApi.interceptors.request.use((req) => {
  const token = localStorage.getItem('adminToken')
  if (token) {
    req.headers.Authorization = `Bearer ${token}`
  }
  return req
})

export default adminApi
