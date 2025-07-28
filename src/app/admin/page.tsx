'use client'

import React, { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { 
  Shield, 
  CheckCircle, 
  XCircle, 
  Clock, 
  User, 
  DollarSign, 
  Calendar,
  Eye,
  LogOut,
  Lock,
  Unlock,
  AlertTriangle,
  TrendingUp,
  Users,
  CreditCard
} from 'lucide-react'

interface PendingTransaction {
  id: string
  type: 'top-up' | 'transfer'
  amount: number
  description: string
  date: string
  category: string
  reason?: string
  status: 'pending' | 'approved' | 'rejected'
  userEmail: string
  submittedAt: string
  method?: string
  recipient?: string
}

interface AdminStats {
  totalPending: number
  totalApproved: number
  totalRejected: number
  totalAmount: number
}

export default function AdminDashboard() {
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [pendingTransactions, setPendingTransactions] = useState<PendingTransaction[]>([])
  const [selectedTransaction, setSelectedTransaction] = useState<PendingTransaction | null>(null)
  const [showDetailsModal, setShowDetailsModal] = useState(false)
  const [rejectionReason, setRejectionReason] = useState('')
  const [frozenAccounts, setFrozenAccounts] = useState<string[]>([])
  const [stats, setStats] = useState<AdminStats>({
    totalPending: 0,
    totalApproved: 0,
    totalRejected: 0,
    totalAmount: 0
  })
  const router = useRouter()

  useEffect(() => {
    // Check if admin is already logged in
    const adminAuth = localStorage.getItem('adminAuth')
    if (adminAuth === 'true') {
      setIsAuthenticated(true)
      loadPendingTransactions()
      loadFrozenAccounts()
    } else {
      // Redirect to main login if not authenticated
      router.push('/')
    }
  }, [])

  useEffect(() => {
    if (isAuthenticated) {
      loadPendingTransactions()
      // Auto-refresh every 30 seconds
      const interval = setInterval(loadPendingTransactions, 30000)
      return () => clearInterval(interval)
    }
  }, [isAuthenticated])

  const loadPendingTransactions = () => {
    const stored = localStorage.getItem('pendingTransactions')
    const transactions = stored ? JSON.parse(stored) : []
    setPendingTransactions(transactions)
    
    // Calculate stats
    const pending = transactions.filter((t: PendingTransaction) => t.status === 'pending')
    const approved = transactions.filter((t: PendingTransaction) => t.status === 'approved')
    const rejected = transactions.filter((t: PendingTransaction) => t.status === 'rejected')
    const totalAmount = pending.reduce((sum: number, t: PendingTransaction) => sum + t.amount, 0)
    
    setStats({
      totalPending: pending.length,
      totalApproved: approved.length,
      totalRejected: rejected.length,
      totalAmount
    })
  }

  // Load frozen accounts from localStorage
  const loadFrozenAccounts = () => {
    const stored = localStorage.getItem('frozenAccounts')
    const accounts = stored ? JSON.parse(stored) : []
    setFrozenAccounts(accounts)
  }

  // Freeze an account
  const freezeAccount = (email: string) => {
    const updated = [...frozenAccounts, email]
    setFrozenAccounts(updated)
    localStorage.setItem('frozenAccounts', JSON.stringify(updated))
  }

  // Unfreeze an account
  const unfreezeAccount = (email: string) => {
    const updated = frozenAccounts.filter(acc => acc !== email)
    setFrozenAccounts(updated)
    localStorage.setItem('frozenAccounts', JSON.stringify(updated))
  }

  const handleLogout = () => {
    setIsAuthenticated(false)
    localStorage.removeItem('adminAuth')
    router.push('/')
  }

  const approveTransaction = (transactionId: string) => {
    const stored = localStorage.getItem('pendingTransactions')
    const transactions = stored ? JSON.parse(stored) : []
    const updatedTransactions = transactions.map((t: PendingTransaction) => 
      t.id === transactionId 
        ? { ...t, status: 'approved', approvedAt: new Date().toISOString() }
        : t
    )
    localStorage.setItem('pendingTransactions', JSON.stringify(updatedTransactions))
    
    // Update user's actual balance and transactions
    const approvedTransaction = transactions.find((t: PendingTransaction) => t.id === transactionId)
    if (approvedTransaction) {
      // Determine transaction type based on category
      const isTransfer = approvedTransaction.category === 'Transfer'
      const transactionType = isTransfer ? 'outgoing' : 'incoming'
      
      // Add to user's transaction history
      const userTransactions = JSON.parse(localStorage.getItem('transactions') || '[]')
      const newTransaction = {
        id: approvedTransaction.id,
        type: transactionType,
        amount: approvedTransaction.amount,
        description: approvedTransaction.description,
        date: new Date().toISOString().split('T')[0],
        category: approvedTransaction.category,
        reason: approvedTransaction.reason,
        status: 'completed'
      }
      userTransactions.unshift(newTransaction)
      localStorage.setItem('transactions', JSON.stringify(userTransactions))
      
      // Update user's balance in both keys for consistency
      const currentBalance = parseFloat(localStorage.getItem('userBalance') || localStorage.getItem('bankBalance') || '545780.50')
      const newBalance = isTransfer 
        ? currentBalance - approvedTransaction.amount  // Subtract for transfers
        : currentBalance + approvedTransaction.amount  // Add for top-ups
      localStorage.setItem('userBalance', newBalance.toString())
      localStorage.setItem('bankBalance', JSON.stringify(newBalance)) // Also update bankBalance for savings page
      
      // Update received this month amount (only for incoming transactions)
      if (!isTransfer) {
        const currentReceived = parseFloat(localStorage.getItem('bankReceivedThisMonth') || '3000.00')
        const newReceived = currentReceived + approvedTransaction.amount
        localStorage.setItem('bankReceivedThisMonth', JSON.stringify(newReceived))
      }
    }
    
    loadPendingTransactions()
    setShowDetailsModal(false)
  }

  const rejectTransaction = (transactionId: string) => {
    const stored = localStorage.getItem('pendingTransactions')
    const transactions = stored ? JSON.parse(stored) : []
    const updatedTransactions = transactions.map((t: PendingTransaction) => 
      t.id === transactionId 
        ? { ...t, status: 'rejected', rejectedAt: new Date().toISOString(), rejectionReason }
        : t
    )
    localStorage.setItem('pendingTransactions', JSON.stringify(updatedTransactions))
    loadPendingTransactions()
    setShowDetailsModal(false)
    setRejectionReason('')
  }

  const openDetailsModal = (transaction: PendingTransaction) => {
    setSelectedTransaction(transaction)
    setShowDetailsModal(true)
  }

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center p-4">
        <div className="text-center">
          <div className="bg-white rounded-full w-20 h-20 mx-auto mb-4 flex items-center justify-center">
            <Shield className="h-10 w-10 text-slate-900 animate-pulse" />
          </div>
          <h1 className="text-2xl font-bold text-white mb-2">Redirecting to Login...</h1>
          <p className="text-slate-300">Please login with admin credentials</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center">
              <Shield className="h-8 w-8 text-slate-900 mr-3" />
              <div>
                <h1 className="text-2xl font-bold text-gray-900">U.S Bank Admin</h1>
                <p className="text-sm text-gray-600">Transaction Management Dashboard</p>
              </div>
            </div>
            <button
              onClick={handleLogout}
              className="flex items-center space-x-2 px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
            >
              <LogOut className="h-4 w-4" />
              <span>Logout</span>
            </button>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="p-2 bg-yellow-100 rounded-lg">
                <Clock className="h-6 w-6 text-yellow-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Pending</p>
                <p className="text-2xl font-bold text-gray-900">{stats.totalPending}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="p-2 bg-green-100 rounded-lg">
                <CheckCircle className="h-6 w-6 text-green-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Approved</p>
                <p className="text-2xl font-bold text-gray-900">{stats.totalApproved}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="p-2 bg-red-100 rounded-lg">
                <XCircle className="h-6 w-6 text-red-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Rejected</p>
                <p className="text-2xl font-bold text-gray-900">{stats.totalRejected}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="p-2 bg-blue-100 rounded-lg">
                <DollarSign className="h-6 w-6 text-blue-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Pending Amount</p>
                <p className="text-2xl font-bold text-gray-900">
                  ${stats.totalAmount.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Account Management Section */}
        <div className="bg-white rounded-lg shadow">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-lg font-semibold text-gray-900">Account Management</h2>
            <p className="text-sm text-gray-600">Manage user account access and restrictions</p>
          </div>

          <div className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* User Account Controls */}
              <div className="space-y-4">
                <h3 className="text-md font-medium text-gray-900">User Account: Michael Paul</h3>
                <p className="text-sm text-gray-600">roofingconstructionboss@gmail.com</p>
                
                <div className="flex items-center space-x-4">
                  {frozenAccounts.includes('roofingconstructionboss@gmail.com') ? (
                    <button
                      onClick={() => unfreezeAccount('roofingconstructionboss@gmail.com')}
                      className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
                    >
                      <Unlock className="h-4 w-4 mr-2" />
                      Unfreeze Account
                    </button>
                  ) : (
                    <button
                      onClick={() => freezeAccount('roofingconstructionboss@gmail.com')}
                      className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
                    >
                      <Lock className="h-4 w-4 mr-2" />
                      Freeze Account
                    </button>
                  )}
                </div>

                {frozenAccounts.includes('roofingconstructionboss@gmail.com') && (
                  <div className="bg-red-50 border border-red-200 rounded-md p-4">
                    <div className="flex">
                      <AlertTriangle className="h-5 w-5 text-red-400" />
                      <div className="ml-3">
                        <h4 className="text-sm font-medium text-red-800">Account Frozen</h4>
                        <p className="text-sm text-red-700 mt-1">
                          This account is currently frozen. User cannot perform outgoing transactions.
                        </p>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Account Status Summary */}
              <div className="space-y-4">
                <h3 className="text-md font-medium text-gray-900">Account Status</h3>
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Status:</span>
                    <span className={`text-sm font-medium ${
                      frozenAccounts.includes('roofingconstructionboss@gmail.com') 
                        ? 'text-red-600' 
                        : 'text-green-600'
                    }`}>
                      {frozenAccounts.includes('roofingconstructionboss@gmail.com') ? 'FROZEN' : 'ACTIVE'}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Transfers:</span>
                    <span className={`text-sm font-medium ${
                      frozenAccounts.includes('roofingconstructionboss@gmail.com') 
                        ? 'text-red-600' 
                        : 'text-green-600'
                    }`}>
                      {frozenAccounts.includes('roofingconstructionboss@gmail.com') ? 'BLOCKED' : 'ALLOWED'}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Withdrawals:</span>
                    <span className={`text-sm font-medium ${
                      frozenAccounts.includes('roofingconstructionboss@gmail.com') 
                        ? 'text-red-600' 
                        : 'text-green-600'
                    }`}>
                      {frozenAccounts.includes('roofingconstructionboss@gmail.com') ? 'BLOCKED' : 'ALLOWED'}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Pending Transactions Table */}
        <div className="bg-white rounded-lg shadow">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-lg font-semibold text-gray-900">Pending Transactions</h2>
            <p className="text-sm text-gray-600">Review and approve or reject pending transactions</p>
          </div>

          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Transaction
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    User
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Amount
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Date
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {pendingTransactions.filter(t => t.status === 'pending').map((transaction) => (
                  <tr key={transaction.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="p-2 bg-blue-100 rounded-lg mr-3">
                          <CreditCard className="h-5 w-5 text-blue-600" />
                        </div>
                        <div>
                          <p className="text-sm font-medium text-gray-900">{transaction.description}</p>
                          <p className="text-sm text-gray-500">ID: {transaction.id}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <User className="h-4 w-4 text-gray-400 mr-2" />
                        <span className="text-sm text-gray-900">{transaction.userEmail}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="text-sm font-bold text-green-600">
                        +${transaction.amount.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {new Date(transaction.submittedAt).toLocaleDateString('en-US')}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                        <Clock className="h-3 w-3 mr-1" />
                        Pending
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2">
                      <button
                        onClick={() => openDetailsModal(transaction)}
                        className="text-blue-600 hover:text-blue-900 transition-colors"
                      >
                        <Eye className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => approveTransaction(transaction.id)}
                        className="text-green-600 hover:text-green-900 transition-colors"
                      >
                        <CheckCircle className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => rejectTransaction(transaction.id)}
                        className="text-red-600 hover:text-red-900 transition-colors"
                      >
                        <XCircle className="h-4 w-4" />
                      </button>
                    </td>
                  </tr>
                ))}
                {pendingTransactions.filter(t => t.status === 'pending').length === 0 && (
                  <tr>
                    <td colSpan={6} className="px-6 py-12 text-center">
                      <div className="flex flex-col items-center">
                        <CheckCircle className="h-12 w-12 text-gray-400 mb-4" />
                        <p className="text-gray-500 text-lg">No pending transactions</p>
                        <p className="text-gray-400 text-sm">All transactions have been processed</p>
                      </div>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Transaction Details Modal */}
      {showDetailsModal && selectedTransaction && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-md w-full p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold">Transaction Review</h3>
              <button
                onClick={() => setShowDetailsModal(false)}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <XCircle className="h-5 w-5" />
              </button>
            </div>

            <div className="space-y-4">
              <div className="bg-gray-50 p-4 rounded-lg">
                <h4 className="font-medium text-gray-900 mb-2">Transaction Details</h4>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-600">ID:</span>
                    <span className="font-mono">{selectedTransaction.id}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Type:</span>
                    <span className="capitalize">{selectedTransaction.type}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Amount:</span>
                    <span className="font-bold text-green-600">
                      +${selectedTransaction.amount.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Description:</span>
                    <span>{selectedTransaction.description}</span>
                  </div>
                  {selectedTransaction.reason && (
                    <div className="flex justify-between">
                      <span className="text-gray-600">Reason:</span>
                      <span>{selectedTransaction.reason}</span>
                    </div>
                  )}
                  <div className="flex justify-between">
                    <span className="text-gray-600">User:</span>
                    <span>{selectedTransaction.userEmail}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Submitted:</span>
                    <span>{new Date(selectedTransaction.submittedAt).toLocaleString('en-US')}</span>
                  </div>
                </div>
              </div>

              {/* Rejection Reason Input */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Rejection Reason (Optional)
                </label>
                <textarea
                  value={rejectionReason}
                  onChange={(e) => setRejectionReason(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent resize-none"
                  rows={3}
                  placeholder="Enter reason for rejection (will be shown to user)..."
                />
              </div>

              <div className="flex space-x-3">
                <button
                  onClick={() => approveTransaction(selectedTransaction.id)}
                  className="flex-1 bg-green-600 text-white py-2 px-4 rounded-lg hover:bg-green-700 transition-colors font-medium flex items-center justify-center space-x-2"
                >
                  <CheckCircle className="h-4 w-4" />
                  <span>Approve</span>
                </button>
                <button
                  onClick={() => rejectTransaction(selectedTransaction.id)}
                  className="flex-1 bg-red-600 text-white py-2 px-4 rounded-lg hover:bg-red-700 transition-colors font-medium flex items-center justify-center space-x-2"
                >
                  <XCircle className="h-4 w-4" />
                  <span>Reject</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
