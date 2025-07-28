'use client'

import React, { useState, useEffect } from 'react'
import { CheckCircle, X, DollarSign, ArrowUpRight, ArrowDownLeft } from 'lucide-react'

interface ToastProps {
  message: string
  type: 'success' | 'error' | 'info'
  isVisible: boolean
  onClose: () => void
  transactionType?: 'incoming' | 'outgoing' | 'topup'
  amount?: number
}

export default function Toast({ 
  message, 
  type, 
  isVisible, 
  onClose, 
  transactionType,
  amount 
}: ToastProps) {
  const [progress, setProgress] = useState(100)

  useEffect(() => {
    if (isVisible) {
      setProgress(100) // Reset progress when showing
      
      // Start progress countdown
      const progressInterval = setInterval(() => {
        setProgress(prev => {
          if (prev <= 0) {
            return 0
          }
          return prev - 2.5 // Decrease by 2.5% every 100ms (4 seconds total)
        })
      }, 100)

      // Auto close after 4 seconds
      const timer = setTimeout(() => {
        onClose()
      }, 4000)
      
      return () => {
        clearTimeout(timer)
        clearInterval(progressInterval)
      }
    }
  }, [isVisible, onClose])

  if (!isVisible) return null

  const getIcon = () => {
    if (transactionType === 'incoming' || transactionType === 'topup') {
      return <ArrowDownLeft className="h-6 w-6 text-green-500" />
    } else if (transactionType === 'outgoing') {
      return <ArrowUpRight className="h-6 w-6 text-blue-500" />
    }
    return <CheckCircle className="h-6 w-6 text-green-500" />
  }

  const getColorClasses = () => {
    switch (type) {
      case 'success':
        return 'bg-white/95 border-green-200 shadow-xl shadow-green-100/50 ring-1 ring-green-100'
      case 'error':
        return 'bg-white/95 border-red-200 shadow-xl shadow-red-100/50 ring-1 ring-red-100'
      default:
        return 'bg-white/95 border-blue-200 shadow-xl shadow-blue-100/50 ring-1 ring-blue-100'
    }
  }

  return (
    <div className="fixed top-4 left-4 right-4 sm:left-1/2 sm:right-auto sm:transform sm:-translate-x-1/2 z-50">
      <div 
        className={`
          ${getColorClasses()}
          max-w-sm w-full mx-auto border rounded-xl p-4 backdrop-blur-sm transform transition-all duration-500 ease-in-out
          ${isVisible ? 'translate-y-0 opacity-100 scale-100' : '-translate-y-full opacity-0 scale-95'}
        `}
      >
        <div className="flex items-start space-x-3">
          <div className="flex-shrink-0 mt-0.5">
            <div className="p-2 rounded-full bg-gradient-to-r from-green-50 to-emerald-50 border border-green-100">
              {getIcon()}
            </div>
          </div>
          
          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between">
              <h4 className="text-sm font-semibold text-gray-900 pr-2">
                {type === 'success' ? 'Transaction Successful!' : type === 'error' ? 'Transaction Failed' : 'Notification'}
              </h4>
              <button
                onClick={onClose}
                className="flex-shrink-0 text-gray-400 hover:text-gray-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 rounded-full p-1 transition-colors hover:bg-gray-100"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
            
            <p className="mt-1 text-sm text-gray-600 leading-relaxed break-words">
              {message}
            </p>
            
            {amount && (
              <div className="mt-3 flex items-center justify-between bg-gray-50 rounded-lg px-3 py-2">
                <div className="flex items-center">
                  <DollarSign className="h-4 w-4 text-gray-500 mr-1" />
                  <span className="text-xs text-gray-500 uppercase tracking-wide font-medium">Amount</span>
                </div>
                <span className={`text-lg font-bold ${
                  transactionType === 'outgoing' ? 'text-red-600' : 'text-green-600'
                }`}>
                  {transactionType === 'outgoing' ? '-' : '+'}
                  ${amount.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                </span>
              </div>
            )}
          </div>
        </div>
        
        {/* Progress bar */}
        <div className="mt-4 w-full bg-gray-200 rounded-full h-1.5 overflow-hidden">
          <div 
            className={`h-1.5 rounded-full transition-all duration-100 ease-linear ${
              type === 'success' ? 'bg-gradient-to-r from-green-500 to-emerald-500' : 
              type === 'error' ? 'bg-gradient-to-r from-red-500 to-rose-500' : 
              'bg-gradient-to-r from-blue-500 to-indigo-500'
            }`}
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>
    </div>
  )
}
