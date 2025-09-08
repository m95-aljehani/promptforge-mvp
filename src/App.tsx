import React from 'react'
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider, useAuth } from '@/contexts/AuthContext'
import { PromptProvider } from '@/contexts/PromptContext'
import { Dashboard } from '@/components/Dashboard'
import { AuthPage } from '@/components/AuthPage'
import { LoadingSpinner } from '@/components/ui/LoadingSpinner'

function AppRoutes() {
  const { user, loading } = useAuth()

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner />
      </div>
    )
  }

  return (
    <Routes>
      <Route 
        path="/auth" 
        element={user ? <Navigate to="/" replace /> : <AuthPage />} 
      />
      <Route 
        path="/" 
        element={user ? <Dashboard /> : <Navigate to="/auth" replace />} 
      />
      <Route 
        path="*" 
        element={<Navigate to="/" replace />} 
      />
    </Routes>
  )
}

function App() {
  return (
    <Router>
      <AuthProvider>
        <PromptProvider>
          <div className="min-h-screen bg-gray-50">
            <AppRoutes />
          </div>
        </PromptProvider>
      </AuthProvider>
    </Router>
  )
}

export default App