'use client'

import React, { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Lock, User, Eye, EyeOff } from 'lucide-react'

export default function LoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')
  const router = useRouter()

  // Predefined account credentials
  const VALID_EMAIL = 'roofingconstructionboss@gmail.com'
  const VALID_PASSWORD = 'michaelpaulwoods121'
  
  // Admin credentials
  const ADMIN_EMAIL = 'admin@usbank.com'
  const ADMIN_PASSWORD = 'bankadmin2025'

  const handleEmailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setEmail(e.target.value)
  }

  const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setPassword(e.target.value)
  }

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setIsLoading(true)
    setError('')

    // Simulate loading time
    await new Promise(resolve => setTimeout(resolve, 1000))

    // Check for admin login
    if (email === ADMIN_EMAIL && password === ADMIN_PASSWORD) {
      localStorage.setItem('adminAuth', 'true')
      router.push('/admin')
    }
    // Check for regular user login
    else if (email === VALID_EMAIL && password === VALID_PASSWORD) {
      localStorage.setItem('bankAuth', 'true')
      localStorage.setItem('userEmail', email)
      router.push('/dashboard')
    } else {
      setError('Invalid email or password. Please try again.')
    }
    
    setIsLoading(false)
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-900 via-blue-800 to-blue-900 flex items-center justify-center p-4">
      <div className="max-w-md w-full">
        {/* Logo and Title */}
        <div className="text-center mb-8">
          <div className="bg-white rounded-full w-20 h-20 mx-auto mb-4 flex items-center justify-center">
            <Lock className="h-10 w-10 text-blue-900" />
          </div>
          <h1 className="text-3xl font-bold text-white mb-2">U.S Bank</h1>
          <p className="text-blue-200">secure online banking</p>
        </div>

        {/* Login Form */}
        <div className="bg-white rounded-lg shadow-2xl p-8">
          <h2 className="text-2xl font-semibold text-gray-800 mb-6 text-center">
            Sign In to Your Account
          </h2>

          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded mb-4">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                Email Address
              </label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
                <input
                  id="email"
                  name="email"
                  type="email"
                  value={email}
                  onChange={handleEmailChange}
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none text-gray-900 bg-white"
                  placeholder="Enter your email"
                  autoComplete="email"
                  required
                />
              </div>
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
                Password
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
                <input
                  id="password"
                  name="password"
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={handlePasswordChange}
                  className="w-full pl-10 pr-10 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none text-gray-900 bg-white"
                  placeholder="Enter your password"
                  autoComplete="current-password"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-blue-900 text-white py-3 px-4 rounded-lg hover:bg-blue-800 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition duration-200 font-medium disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? 'Signing in...' : 'Sign In'}
            </button>
          </form>

          {/* Demo account instructions removed */}
        </div>

        {/* Security Notice */}
        <div className="mt-6 text-center">
          <p className="text-xs text-blue-200">
            Your connection is secured with 256-bit SSL encryption
          </p>
        </div>
      </div>
    </div>
  )
}
