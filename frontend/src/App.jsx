import { useState } from 'react'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import Login from './pages/Login'
import Signup from './pages/Signup'
import Dashboard from './pages/Dashboard'
import RiskSearch from './pages/RiskSearch'
import Disputes from './pages/Disputes'

const PrivateRoute = ({ children }) => {
  const token = localStorage.getItem('token')
  return token ? children : <Navigate to="/login" />
}

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Navigate to="/login" />} />
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="/dashboard" element={<PrivateRoute><Dashboard /></PrivateRoute>} />
        <Route path="/risk" element={<PrivateRoute><RiskSearch /></PrivateRoute>} />
        <Route path="/disputes" element={<PrivateRoute><Disputes /></PrivateRoute>} />
      </Routes>
    </BrowserRouter>
  )
}

export default App