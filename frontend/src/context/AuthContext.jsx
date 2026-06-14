import { createContext, useContext, useState, useEffect } from 'react'

const AuthContext = createContext()

export const AuthProvider = ({ children }) => {
  const [token, setToken] = useState(localStorage.getItem('token') || null)
  const [owner, setOwner] = useState(JSON.parse(localStorage.getItem('owner')) || null)

  const login = (token, owner) => {
    localStorage.setItem('token', token)
    localStorage.setItem('owner', JSON.stringify(owner))
    setToken(token)
    setOwner(owner)
  }

  const logout = () => {
    localStorage.removeItem('token')
    localStorage.removeItem('owner')
    setToken(null)
    setOwner(null)
  }

  return (
    <AuthContext.Provider value={{ token, owner, login, logout }}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => useContext(AuthContext)