import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider, useAuth } from './context/AuthContext'
import Login from './pages/Login'
import Register from './pages/Register'
import Dashboard from './pages/Dashboard'
import ShopPage from './pages/ShopPage'
import ForgotPassword from './pages/ForgotPassword'
import AdminLogin from './pages/AdminLogin'
import AdminDashboard from './pages/AdminDashboard'

const ProtectedRoute = ({ children }) => {
  const { token } = useAuth()
  return token ? children : <Navigate to='/login' />
}

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path='/login' element={<Login />} />
          <Route path='/register' element={<Register />} />
          <Route path='/forgot-password' element={<ForgotPassword />} />
          <Route path='/admin/login' element={<AdminLogin />} />
          <Route path='/admin/dashboard' element={<AdminDashboard />} />
          <Route path='/dashboard' element={
            <ProtectedRoute>
              <Dashboard />
            </ProtectedRoute>
          } />
          <Route path='/shop/:slug' element={<ShopPage />} />
          <Route path='/' element={<Navigate to='/login' />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  )
}

export default App